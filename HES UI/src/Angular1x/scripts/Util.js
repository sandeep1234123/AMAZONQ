function ValidateFileFormate(fileName) {
   // console.log("I am here!!")
    var temp = false;
    var ext = fileName.substring(fileName.lastIndexOf(".") + 1);
    var extns = ["xls", "xlsx", "txt", "csv", "pth", "bin", "dlm", "gxt", "zxt", "hex", "zlm"];
    for (i = 0; i < extns.length; i++) {
      //  console.log(ext.toLowerCase() == extns[i].toLowerCase())
        if (ext.toLowerCase() == extns[i].toLowerCase()) {
            //write any other discriptive logic
            temp = true;
            break;
        }
    }
    return temp;
}


function ValidateFileFormatForUpdateFirmware(fileName) {
     var temp = false;
     var ext = fileName.substring(fileName.lastIndexOf(".") + 1);
     var extns = ["pth", "bin", "hex", "txt", "zip"];
    
     for (i = 0; i < extns.length; i++) {
         if (ext.toLowerCase() == extns[i].toLowerCase()) {
             temp = true;
             break;
         }
     }
     return temp;
 }


function ValidateFileSize(fileSize) {
    var temp = false;
    if (fileSize < 1000000) {
        temp = true;
    }
    return temp
}

function GetHtmlLinkWithIcon(iconCode) {
    if (iconCode == 1)
        return '<i class="fa fa-exclamation-circle" aria-hidden="true></i>';
    else
        return '<i class="fa fa-check-circle" aria-hidden="true"></i>';
}

function IsMeterNumberAvailable(parameterName) {
    if (parameterName == 'MeterNumber')
        return true;
    else
        return false;
}

function IsDateValid(parameterName) {
    if (parameterName != 'Invalid date')
        return true;
    else
        return false;
}

function stripEndQuotes(s) {
    var t = s.length;
    if (s.charAt(0) == '"') s = s.substring(1, t--);
    if (s.charAt(--t) == '"') s = s.substring(0, t);
    return s;
}