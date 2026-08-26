
`ps > gcm *Module*
`ps > get-module -ListAvailable -All
`ps > import-module module.psm1
`ps > get-module
`ps > $env:PSModulePath 
`ps > remove-module module.psm1
`ps > gcm -Module module

add document to the module :
`ps > new-modulemanifest -ModuleToProcess module.psm1 module.psd1



