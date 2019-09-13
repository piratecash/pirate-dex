import {Apis} from "bitsharesjs-ws";
/** This file centralized customization and branding efforts throughout the whole wallet and is meant to facilitate
 *  the process.
 *
 *  @author Stefan Schiessl <stefan.schiessl@blockchainprojectsbv.com>
 */

/**
 * Determine if we are running on testnet or mainnet
 * @private
 */
function _isTestnet() {
    const chainId = (Apis.instance().chain_id || "4018d784").substr(0, 8);
    if (chainId === "4018d784") {
        return false;
    } else {
        // treat every other chain as testnet, exact would be chainId === "39f5e2ed"
        return true;
    }
}

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
    return "PirateCash";
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
    return "https://wallet.piratecash.net";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
    return {
        url: "https://faucet.bitshares.eu/onboarding", // 2017-12-infrastructure worker proposal
        show: true,
        editable: false
    };
}

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */
export function getLogo() {
    return require("assets/logo-ico-blue.png");
}

/**
 * Default set theme for the UI
 * @returns {string}
 */
export function getDefaultTheme() {
    // possible ["darkTheme", "lightTheme", "midnightTheme"]
    return "darkTheme";
}

/**
 * Default login method. Either "password" (for cloud login mode) or "wallet" (for local wallet mode)
 * @returns {string}
 */
export function getDefaultLogin() {
    // possible: one of "password", "wallet"
    return "password";
}

/**
 * Default units used by the UI
 *
 * @returns {[string,string,string,string,string,string]}
 */
export function getUnits() {
    if (_isTestnet()) {
        return ["TEST"];
    } else {
        return [
            "BTS",
            "PIRATE.BTC",
            "PIRATE.LTC",
            "PIRATE.DOGE",
            "PIRATE.PIRATE"
        ];
    }
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */

export function getMyMarketsBases() {
    return ["PIRATE.PIRATE", "PIRATE.BTC", "PIRATE.LTC", "PIRATE.DOGE", "BTS"];
}

/**
 * These are the default quotes that are shown after selecting a base
 *
 * @returns {[string]}
 */
export function getMyMarketsQuotes() {
    let tokens = {
        nativeTokens: [],
        bridgeTokens: [],
        gdexTokens: [],
        openledgerTokens: [],
        rudexTokens: [],
        sparkTokens: [],
        xbtsxTokens: [],
        otherTokens: [
            "PIRATE.PIRATE",
            "PIRATE.BTC",
            "PIRATE.LTC",
            "PIRATE.BCC",
            "PIRATE.BCCX",
            "PIRATE.DOGE",
            "PIRATE.DLX",
            "PIRATE.PNY",
            "PIRATE.PZM"

        ]
    };

    let allTokens = [];
    for (let type in tokens) {
        allTokens = allTokens.concat(tokens[type]);
    }
    return allTokens;
}

/**
 * The featured markets displayed on the landing page of the UI
 *
 * @returns {list of string tuples}
 */
export function getFeaturedMarkets(quotes = []) {
    return [
        ["PIRATE.PIRATE", "BTS"],
        ["PIRATE.PIRATE", "PIRATE.BTC"],
        ["PIRATE.PIRATE", "PIRATE.LTC"],
        ["PIRATE.PIRATE", "PIRATE.DOGE"],
        ["PIRATE.BCCX", "BTS"],
        ["PIRATE.BCCX", "PIRATE.BTC"],
        ["PIRATE.BCCX", "PIRATE.LTC"],
        ["PIRATE.BCCX", "PIRATE.DOGE"],
        ["PIRATE.BCCX", "PIRATE.PIRATE"],
        ["PIRATE.DLX", "BTS"],
        ["PIRATE.DLX", "PIRATE.BTC"],
        ["PIRATE.DLX", "PIRATE.LTC"],
        ["PIRATE.DLX", "PIRATE.DOGE"],
        ["PIRATE.DLX", "PIRATE.PIRATE"],
        ["PIRATE.BCC", "BTS"],
        ["PIRATE.BCC", "PIRATE.BTC"],
        ["PIRATE.BCC", "PIRATE.LTC"],
        ["PIRATE.BCC", "PIRATE.DOGE"],
        ["PIRATE.BCC", "PIRATE.PIRATE"],
        ["PIRATE.PNY", "PIRATE.BTC"],
        ["PIRATE.PNY", "PIRATE.LTC"],
        ["PIRATE.PNY", "PIRATE.DOGE"],
        ["PIRATE.PNY", "PIRATE.PIRATE"],
        ["PIRATE.PZM", "PIRATE.BTC"],
        ["PIRATE.PZM", "PIRATE.LTC"],
        ["PIRATE.PZM", "PIRATE.DOGE"],
        ["PIRATE.PZM", "PIRATE.PIRATE"],
        ["PIRATE.DOGE", "BTS"],
        ["PIRATE.DOGE", "PIRATE.BTC"],
        ["PIRATE.DOGE", "PIRATE.LTC"],
        ["PIRATE.DOGE", "PIRATE.PIRATE"],
    ].filter(a => {
        if (!quotes.length) return true;
        return quotes.indexOf(a[0]) !== -1;
    });
}

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
    return ["PIRATE."];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for BitAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
    // e..g "OPEN.", "bit"
    return ["PIRATE."];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
    return ["PIRATE"].indexOf(gateway) >= 0;
}

export function getSupportedLanguages() {
    // not yet supported
}

export function getAllowedLogins() {
    // possible: list containing any combination of ["password", "wallet"]
    return ["password", "wallet"];
}

export function getConfigurationAsset() {
    let assetSymbol = null;
    if (_isTestnet()) {
        assetSymbol = "NOTIFICATIONS";
    } else {
        assetSymbol = "TEST";
    }
    // explanation will be parsed out of the asset description (via split)
    return {
        symbol: assetSymbol,
        explanation:
            "This asset is used for decentralized configuration of the BitShares UI placed under bitshares.org."
    };
}
