/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServerAuthorizationCodeResponse } from "../response/ServerAuthorizationCodeResponse";
import { ClientConfigurationError } from "../error/ClientConfigurationError";
import { StringUtils } from "../utils/StringUtils";
import {
    Constants,
} from "../utils/Constants";

/**
 * Url object class which can perform various transformations on url strings.
 */
export class UrlString {
    /**
     * Ensure urls are lower case and end with a / character.
     * @param url
     */
    static canonicalizeUrl(url: string): URL {
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }
        let canonicalUrl = new URL(url.toLowerCase());
        UrlString.validateAsUri(canonicalUrl);

        if (!canonicalUrl.pathname.endsWith(Constants.FORWARD_SLASH)) {
            canonicalUrl.pathname += "/";
        }

        return canonicalUrl;
    }
    /**
     * Throws if urlString passed is not a valid authority URI string.
     */
    static validateAsUri(url: URL): void {
        // Throw error if uri is insecure.
        if (url.protocol !== "https:") {
            throw ClientConfigurationError.createInsecureAuthorityUriError(
                url.toString()
            );
        }
    }

    /**
     * Given a url and a query string return the url with provided query string appended
     * @param url
     * @param queryString
     */
    static appendQueryString(urlString: string, queryString: string): string {
        const url = new URL(urlString);
        url.search = queryString;
        return url.href;
    }

    /**
     * Returns a url with the hash removed
     * @param url
     */
    static removeHashFromUrl(urlString: string): string {
        const url = new URL(urlString);
        url.hash = "";
        return url.href;
    }

    static getAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
        return new URL(relativeUrl, baseUrl).toString();
    }

    /**
     * Returns an array of path segments
     * @param urlString 
     * @returns 
     */
    static getPathSegments(urlString: string | URL): string[] {
        const urlObject = new URL(urlString);
        const pathname = urlObject.pathname;

        // Remove leading slash
        if (pathname.charAt(0) === "/") {
            return pathname.substring(1).split("/");
        } else {
            return pathname.split("/");
        }
    }

    /**
     * Parses hash string from given string. Returns empty string if no hash symbol is found.
     * @param hashString
     */
    static stripHashSymbol(hashString: string): string {
        const hashIndex1 = hashString.indexOf("#");
        const hashIndex2 = hashString.indexOf("#/");
        if (hashIndex2 > -1) {
            return hashString.substring(hashIndex2 + 2);
        } else if (hashIndex1 > -1) {
            return hashString.substring(hashIndex1 + 1);
        }
        return Constants.EMPTY_STRING;
    }

    /**
     * Parses query server response string from given string.
     * Extract hash between '?code=' and '#' if trailing '# is present.
     * Returns empty string if no query symbol is found.
     * @param queryString
     */
    static parseQueryServerResponse(queryString: string): string {
        const queryIndex1 = queryString.indexOf("?code");
        const queryIndex2 = queryString.indexOf("/?code");
        const hashIndex = queryString.indexOf("#");
        if (queryIndex2 > -1 && hashIndex > -1) {
            return queryString.substring(queryIndex2 + 2, hashIndex);
        } else if (queryIndex2 > -1) {
            return queryString.substring(queryIndex2 + 2);
        } else if (queryIndex1 > -1 && hashIndex > -1) {
            return queryString.substring(queryIndex1 + 1, hashIndex);
        } else if (queryIndex1 > -1) {
            return queryString.substring(queryIndex1 + 1);
        }
        return Constants.EMPTY_STRING;
    }

    /**
     * Returns URL hash as server auth code response object.
     */
    static getDeserializedResponse(response: string): ServerAuthorizationCodeResponse {
        // Strip the # symbol if present
        const parsedHash = UrlString.stripHashSymbol(response);
        // If # symbol was not present, above will return empty string, so give original hash value
        let deserializedQueryString: ServerAuthorizationCodeResponse = {};
        const searchParams = new URLSearchParams(parsedHash);
        for (const [key, value] of searchParams.entries()) {
            deserializedQueryString[key] = value;
        }

        return deserializedQueryString;
    }

    /**
     * Check if the hash of the URL string contains known properties
     */
    static hashContainsKnownProperties(hash: string): boolean {
        if (StringUtils.isEmpty(hash) || hash.indexOf("=") < 0) {
            // Hash doesn't contain key/value pairs
            return false;
        }

        const parameters: ServerAuthorizationCodeResponse =
            UrlString.getDeserializedResponse(hash);
        return !!(
            parameters.code ||
            parameters.error_description ||
            parameters.error ||
            parameters.state
        );
    }
}
