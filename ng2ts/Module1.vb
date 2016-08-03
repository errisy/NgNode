Module Module1

    Sub Main()
        Dim info As New ProcessStartInfo
        info.WorkingDirectory = ParentDirectory(ParentDirectory(ParentDirectory(AppDomain.CurrentDomain.BaseDirectory))) + "\"

        Dim fileNPM As New IO.FileInfo(info.WorkingDirectory + "start.bat")
        If Not fileNPM.Exists Then
            IO.File.WriteAllText(fileNPM.FullName, "npm start")
        End If
        Console.WriteLine("Invoking npm start...")
        info.FileName = fileNPM.FullName
        'info.RedirectStandardInput = True
        'info.RedirectStandardOutput = True
        'info.UseShellExecute = False
        Dim npm = Process.Start(info)
        'npm.WaitForExit()

    End Sub
    Function ParentDirectory(value As String) As String
        Static regSeparator As New System.Text.RegularExpressions.Regex("[\\\/]")
        Dim m As System.Text.RegularExpressions.MatchCollection = regSeparator.Matches(value)
        If m.Count > 0 Then
            Return value.Substring(0, m(m.Count - 1).Index)
        Else
            Return value
        End If
    End Function
End Module
