Pod::Spec.new do |s|
  s.name           = 'DigitalInk'
  s.version        = '1.0.0'
  s.summary        = 'Google ML Kit Digital Ink bridge for Clinical Ink'
  s.description    = 'An Expo module that exposes on-device handwriting recognition.'
  s.author         = 'Clinical Ink Prototype'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleMLKit/DigitalInkRecognition', '8.0.0'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
