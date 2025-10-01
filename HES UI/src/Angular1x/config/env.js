(function (window) {
    window.__env = window.__env || {};

    var data = location.origin + '/';
    window.__env.WEBSERVERURL = GetWebServerURL(data);
    window.__env.VERSION = '1.0.2.2';
    window.__env.enableDebug = false;
    window.__env.brandTitle = 'MDMS';
    window.__env.headerLogo1Path = '../../../../Angular1x/images/Branding/header-top-left-icon.png';
    window.__env.showHeaderLogo2 = false;
    window.__env.headerLogo2Path = '../../../../Angular1x/images/Branding/header-top-center-icon.png';
    window.__env.headerLogo2Title = '';
    window.__env.homeLogoPath = '../Angular1x/images/Branding/Logo.png';
    window.__env.homeLogoTitle = '';

}(this));


function GetWebServerURL(data) {
    var WEBSERVERURL = null;
    if (data != null && data != '' && data != undefined) {
        WEBSERVERURL = data;
    }
    else {
        // Try different common development ports
        WEBSERVERURL = 'http://localhost:5001/';
    }
    return WEBSERVERURL;
}