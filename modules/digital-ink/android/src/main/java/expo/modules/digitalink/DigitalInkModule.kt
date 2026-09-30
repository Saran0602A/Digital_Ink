package expo.modules.digitalink

import com.google.mlkit.common.MlKitException
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.vision.digitalink.recognition.DigitalInkRecognition
import com.google.mlkit.vision.digitalink.recognition.DigitalInkRecognitionModel
import com.google.mlkit.vision.digitalink.recognition.DigitalInkRecognitionModelIdentifier
import com.google.mlkit.vision.digitalink.recognition.DigitalInkRecognizerOptions
import com.google.mlkit.vision.digitalink.recognition.Ink
import com.google.mlkit.vision.digitalink.recognition.RecognitionContext
import com.google.mlkit.vision.digitalink.recognition.WritingArea
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class DigitalInkModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DigitalInk")

    AsyncFunction("isModelDownloaded") { languageTag: String, promise: Promise ->
      val model = createModel(languageTag, promise) ?: return@AsyncFunction
      RemoteModelManager.getInstance()
        .isModelDownloaded(model)
        .addOnSuccessListener { downloaded -> promise.resolve(downloaded) }
        .addOnFailureListener { error ->
          promise.reject("ERR_MODEL_STATUS", error.localizedMessage, error)
        }
    }

    AsyncFunction("downloadModel") { languageTag: String, promise: Promise ->
      val model = createModel(languageTag, promise) ?: return@AsyncFunction
      val conditions = DownloadConditions.Builder().build()

      RemoteModelManager.getInstance()
        .download(model, conditions)
        .addOnSuccessListener { promise.resolve() }
        .addOnFailureListener { error ->
          promise.reject("ERR_MODEL_DOWNLOAD", error.localizedMessage, error)
        }
    }

    AsyncFunction("recognize") {
        inkJson: String,
        languageTag: String,
        width: Double,
        height: Double,
        preContext: String,
        promise: Promise ->
      val model = createModel(languageTag, promise) ?: return@AsyncFunction

      try {
        val ink = parseInk(inkJson)
        val recognizer = DigitalInkRecognition.getClient(
          DigitalInkRecognizerOptions.builder(model).build()
        )
        val context = RecognitionContext.builder()
          .setWritingArea(WritingArea(width.toFloat(), height.toFloat()))
          .setPreContext(preContext.takeLast(20))
          .build()

        recognizer.recognize(ink, context)
          .addOnSuccessListener { result ->
            val candidates = result.candidates.map { candidate -> candidate.text }
            promise.resolve(mapOf("candidates" to candidates))
            recognizer.close()
          }
          .addOnFailureListener { error ->
            promise.reject("ERR_RECOGNITION", error.localizedMessage, error)
            recognizer.close()
          }
      } catch (error: Exception) {
        promise.reject("ERR_INVALID_INK", error.localizedMessage, error)
      }
    }
  }

  private fun createModel(
    languageTag: String,
    promise: Promise
  ): DigitalInkRecognitionModel? {
    return try {
      val identifier = DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageTag)
      if (identifier == null) {
        promise.reject("ERR_LANGUAGE_UNSUPPORTED", "No Digital Ink model exists for $languageTag.", null)
        null
      } else {
        DigitalInkRecognitionModel.builder(identifier).build()
      }
    } catch (error: MlKitException) {
      promise.reject("ERR_LANGUAGE_INVALID", error.localizedMessage, error)
      null
    }
  }

  private fun parseInk(inkJson: String): Ink {
    val document = JSONObject(inkJson)
    val strokesJson = document.getJSONArray("strokes")
    val inkBuilder = Ink.builder()

    for (strokeIndex in 0 until strokesJson.length()) {
      val pointsJson = strokesJson.getJSONObject(strokeIndex).getJSONArray("points")
      val strokeBuilder = Ink.Stroke.builder()

      for (pointIndex in 0 until pointsJson.length()) {
        val point = pointsJson.getJSONObject(pointIndex)
        strokeBuilder.addPoint(
          Ink.Point.create(
            point.getDouble("x").toFloat(),
            point.getDouble("y").toFloat(),
            point.getLong("t")
          )
        )
      }

      inkBuilder.addStroke(strokeBuilder.build())
    }

    return inkBuilder.build()
  }
}
