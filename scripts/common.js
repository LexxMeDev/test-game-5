var IsMobilePlatform = false;

// Known OS labels
const OS_TYPES = {
    WINDOWS: 'windows',
    MAC_OS: 'macOs',
    LINUX: 'linux',
    CHROME_OS: 'chromeOs',
    ANDROID_MOBILE: 'androidMobile',
    ANDROID_TABLET: 'androidTablet',
    ANDROID_TV: 'androidTv',
    FIRE_OS: 'fireOs',
    IOS_IPHONE: 'iPhone',
    IOS_IPAD: 'iPad',
    IOS_IPOD: 'iPod',
    TIZEN: 'tizen',
    WEB_OS: 'webOs',
    PLAYSTATION: 'playStation',
    XBOX: 'xbox',
    NINTENDO_SWITCH: 'nintendoSwitch',
    UNKNOWN: 'unknown'
};

let cachedConfigFile = null;
let configUrl = '';
var showedRewardVideo = false;
var lastAdDisplayDate = new Date().toISOString();
var environment = {
    appId: "",
    payload: "",
    screen: {
        isFullscreen: false,
        orientation: {
            value: "",          // portrait, landscape
            isLock: false
        }
    },
    deviceInfo: {
        isTv: false,
        isTable: false,
        isMobile: false,
        isDesktop: false,
        deviceType: "",          // desktop, mobile, tablet, tv
        osType: OS_TYPES.UNKNOWN  // filled at runtime
    },
    browser: {
        languageCode: "",       // ru, en, tr and more...
        topLevelDomain: ""
    }
};

environment.browser.languageCode = navigator.language || navigator.userLanguage;
environment.browser.topLevelDomain = (function(){
    const parts = location.hostname.split('.');
    return parts.length > 1 ? parts.pop() : '';
})();

// Device & OS detection
function detectDeviceInfo() {
    const ua = navigator.userAgent || '';
    const platform = navigator.userAgentData?.platform || navigator.platform || '';
    const info = {
        isTv: false,
        isTable: false,
        isMobile: false,
        isDesktop: false,
        deviceType: '',
        osType: OS_TYPES.UNKNOWN
    };

    // iOS family
    if (/iPhone/i.test(ua)) {
        info.osType = OS_TYPES.IOS_IPHONE;
        info.isMobile = true;
    } else if (/iPad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        info.osType = OS_TYPES.IOS_IPAD;
        info.isTable = true;
    } else if (/iPod/i.test(ua)) {
        info.osType = OS_TYPES.IOS_IPOD;
        info.isMobile = true;
    }

    // Android
    else if (/Android/i.test(ua)) {
        if (/TV|AFT|BRAVIA|Shield|T[0-9]{2}[A-Z0-9]|SmartTV/i.test(ua)) {
            info.osType = OS_TYPES.ANDROID_TV;
            info.isTv = true;
        } else if (/Mobile/i.test(ua)) {
            info.osType = OS_TYPES.ANDROID_MOBILE;
            info.isMobile = true;
        } else {
            info.osType = OS_TYPES.ANDROID_TABLET;
            info.isTable = true;
        }
    }

    // Desktop OS
    else if (/Windows NT/i.test(ua)) {
        info.osType = OS_TYPES.WINDOWS;
        info.isDesktop = true;
    } else if (/Mac OS X/i.test(ua)) {
        info.osType = OS_TYPES.MAC_OS;
        info.isDesktop = true;
    } else if (/CrOS/i.test(ua)) {
        info.osType = OS_TYPES.CHROME_OS;
        info.isDesktop = true;
    } else if (/Linux/i.test(ua)) {
        info.osType = OS_TYPES.LINUX;
        info.isDesktop = true;
    }

    // -Consoles / Smart‑TV
    else if (/PlayStation/i.test(ua)) {
        info.osType = OS_TYPES.PLAYSTATION;
        info.isTv = true;
    } else if (/Xbox/i.test(ua)) {
        info.osType = OS_TYPES.XBOX;
        info.isTv = true;
    } else if (/Nintendo Switch/i.test(ua)) {
        info.osType = OS_TYPES.NINTENDO_SWITCH;
        info.isTv = true;
    } else if (/Tizen/i.test(ua)) {
        info.osType = OS_TYPES.TIZEN;
        info.isTv = true;
    } else if (/Web0S|webOS/i.test(ua)) {
        info.osType = OS_TYPES.WEB_OS;
        info.isTv = true;
    } else if (/Silk|Fire|AFT/i.test(ua)) {
        info.osType = OS_TYPES.FIRE_OS;
        info.isTv = true;
    }

    // Fallback
    if (!(info.isMobile || info.isTable || info.isTv || info.isDesktop)) {
        info.isDesktop = true; // treat unknown UA as desktop
    }

    info.deviceType = info.isTv ? 'tv' :
        info.isTable ? 'tablet' :
            info.isMobile ? 'mobile' : 'desktop';
    return info;
}

// Populate immediately
environment.deviceInfo = detectDeviceInfo();
IsMobilePlatform = environment.deviceInfo.isMobile || environment.deviceInfo.isTable;

function GetDeviceInfoJson() {
    return JSON.stringify(environment.deviceInfo);
}

//  Orientation helper
function updateOrientation() {
    environment.screen.orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}
updateOrientation();
window.addEventListener('resize', updateOrientation);

// Config & Localization (unchanged from original)
var enabledDefaultLanguage = false;
var defaultLanguageCode = "en";

function LoadConfig(successCallback, errorCallback)
{
    if(configUrl == null || configUrl == "")
    {
        cachedConfigFile = "";
        if(successCallback != null)
            successCallback("");
        return;
    }

    if(cachedConfigFile != null)
    {
        successCallback(cachedConfigFile);
        return;
    }
    LoadStringFromUrl(configUrl, successCallback, errorCallback);
}

function CacheLoadedConfig(json)
{
    cachedConfigFile = json;
    console.log(cachedConfigFile);
}

function GetCachedGameConfig()
{
    return cachedConfigFile;
}

LoadConfig(CacheLoadedConfig);

function GetLoadingScreenLocalization()
{
    let langugages = [
        {
            lang: 'en',
            value: 'Loading'
        },
        {
            lang: 'ru',
            value: 'Загрузка'
        },
        {
            lang: 'tr',
            value: 'Yükleniyor'
        },
    ];

    var languageCode = GetLanguageCode();
    if(languageCode == null)
    {
        return {
            lang: '',
            value: ''
        }
    }
    let translated = langugages.find(lang => lang.lang == languageCode);
    if(translated == null)
        translated = langugages[0];
    return translated;
}

function SendSuccessMessage(request, parameters)
{
    if(request == null) return;
    BaseSendMessage(request.gameObjectName, request.successMethodName, parameters);
}

function SendFailedMessage(request, parameters)
{
    if(request == null) return;
    BaseSendMessage(request.gameObjectName, request.failedMethodName, JSON.stringify(parameters));
}

function SendClosedMessage(request)
{
    if(request == null) return;
    BaseSendMessage(request.gameObjectName, request.closedMethodName);
}


function BaseSendMessage(gameObjectName, functionName, parameters)
{
    if(typeof unityInstance === 'undefined' || unityInstance == null) return;
    if(parameters != null)
    {
        unityInstance.SendMessage(gameObjectName, functionName, parameters);
        return;
    }
    unityInstance.SendMessage(gameObjectName, functionName);
}

function WebRequestToObject(reqeust)
{
    return JSON.parse(reqeust);
}

window.onfocus = function()
{
    if(showedRewardVideo == true)
        return;

    SetFocusOnApp(true);
};

window.onblur = function()
{
    SetFocusOnApp(false);
};

function SetFocusOnApp(isFocus)
{
    BaseSendMessage('GameServices', 'FocusMode', isFocus == true ? 1 : 0);
}

function setElementByIdStyleType(id, type)
{
    var element = document.getElementById(id);
    if(element == null) return;
    if(element.style == null) return;
    element.style.display=type;
}

function GetEnvironmentJson()
{
    return JSON.stringify(environment);
}
