; ; You need to create a single key with values like so :- (where ProgName is a name you choose)


; WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ProgName" "DisplayName" "Some arbitrary string that describes your program in the add/remove control panel"
; WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ProgName" "UninstallString" "The full path to your uninstaller, e.g. $INSTDIR\UninstallMe.exe"
; WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ProgName" "InstallLocation" "The directory in which the uninstaller lives I think, e.g. $INSTDIR"



; ; And then in the uninstall section you need


; DeleteRegKey HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ProgName"