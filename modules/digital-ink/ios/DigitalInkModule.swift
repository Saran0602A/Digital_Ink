import ExpoModulesCore
import MLKitCommon
import MLKitDigitalInkRecognition

public class DigitalInkModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DigitalInk")

    AsyncFunction("isModelDownloaded") { (languageTag: String, promise: Promise) in
      guard let model = self.createModel(languageTag, promise: promise) else { return }
      promise.resolve(ModelManager.modelManager().isModelDownloaded(model))
    }

    AsyncFunction("downloadModel") { (languageTag: String, promise: Promise) in
      guard let model = self.createModel(languageTag, promise: promise) else { return }
      let manager = ModelManager.modelManager()

      if manager.isModelDownloaded(model) {
        promise.resolve(nil)
        return
      }

      var successObserver: NSObjectProtocol?
      var failureObserver: NSObjectProtocol?

      let cleanUp = {
        if let observer = successObserver {
          NotificationCenter.default.removeObserver(observer)
        }
        if let observer = failureObserver {
          NotificationCenter.default.removeObserver(observer)
        }
      }

      successObserver = NotificationCenter.default.addObserver(
        forName: .mlkitModelDownloadDidSucceed,
        object: nil,
        queue: .main
      ) { _ in
        guard manager.isModelDownloaded(model) else { return }
        cleanUp()
        promise.resolve(nil)
      }

      failureObserver = NotificationCenter.default.addObserver(
        forName: .mlkitModelDownloadDidFail,
        object: nil,
        queue: .main
      ) { notification in
        cleanUp()
        let message = notification.userInfo?.values
          .compactMap { $0 as? Error }
          .first?.localizedDescription ?? "The language model download failed."
        promise.reject("ERR_MODEL_DOWNLOAD", message)
      }

      let conditions = ModelDownloadConditions(
        allowsCellularAccess: true,
        allowsBackgroundDownloading: true
      )
      _ = manager.download(model, conditions: conditions)
    }

    AsyncFunction("recognize") {
      (inkJson: String, languageTag: String, width: Double, height: Double, preContext: String, promise: Promise) in
      guard let model = self.createModel(languageTag, promise: promise) else { return }

      do {
        let ink = try self.parseInk(inkJson)
        let options = DigitalInkRecognizerOptions(model: model)
        let recognizer = DigitalInkRecognizer.digitalInkRecognizer(options: options)
        let writingArea = WritingArea(width: Float(width), height: Float(height))
        let context = DigitalInkRecognitionContext(
          preContext: String(preContext.suffix(20)),
          writingArea: writingArea
        )

        recognizer.recognizeHandwriting(from: ink, context: context) { result, error in
          if let error {
            promise.reject("ERR_RECOGNITION", error.localizedDescription)
            return
          }

          let candidates = result?.candidates.map { $0.text } ?? []
          promise.resolve(["candidates": candidates])
        }
      } catch {
        promise.reject("ERR_INVALID_INK", error.localizedDescription)
      }
    }
  }

  private func createModel(_ languageTag: String, promise: Promise) -> DigitalInkRecognitionModel? {
    guard let identifier = DigitalInkRecognitionModelIdentifier(forLanguageTag: languageTag) else {
      promise.reject("ERR_LANGUAGE_UNSUPPORTED", "No Digital Ink model exists for \(languageTag).")
      return nil
    }
    return DigitalInkRecognitionModel(modelIdentifier: identifier)
  }

  private func parseInk(_ json: String) throws -> Ink {
    guard let data = json.data(using: .utf8),
          let object = try JSONSerialization.jsonObject(with: data) as? [String: Any],
          let strokesJson = object["strokes"] as? [[String: Any]] else {
      throw InkParsingError.invalidDocument
    }

    let strokes = try strokesJson.map { strokeJson -> Stroke in
      guard let pointsJson = strokeJson["points"] as? [[String: Any]] else {
        throw InkParsingError.invalidStroke
      }

      let points = try pointsJson.map { pointJson -> StrokePoint in
        guard let x = pointJson["x"] as? NSNumber,
              let y = pointJson["y"] as? NSNumber,
              let time = pointJson["t"] as? NSNumber else {
          throw InkParsingError.invalidPoint
        }
        return StrokePoint(x: x.floatValue, y: y.floatValue, t: time.intValue)
      }

      return Stroke(points: points)
    }

    return Ink(strokes: strokes)
  }
}

private enum InkParsingError: LocalizedError {
  case invalidDocument
  case invalidStroke
  case invalidPoint

  var errorDescription: String? {
    switch self {
    case .invalidDocument: return "The handwriting document is invalid."
    case .invalidStroke: return "A handwriting stroke is invalid."
    case .invalidPoint: return "A handwriting point is invalid."
    }
  }
}
