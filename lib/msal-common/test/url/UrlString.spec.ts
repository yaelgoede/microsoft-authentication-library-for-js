import { TEST_URIS, TEST_HASHES } from "../test_kit/StringConstants";
import { UrlString } from "../../src/url/UrlString";
import {
    ClientConfigurationError,
    ClientConfigurationErrorMessage,
} from "../../src/error/ClientConfigurationError";
import sinon from "sinon";

describe("UrlString.ts Class Unit Tests", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("Creates a valid UrlString object", () => {
        let urlObj = UrlString.canonicalizeUrl(TEST_URIS.TEST_REDIR_URI.toUpperCase());
        expect(urlObj.toString()).toBe(TEST_URIS.TEST_REDIR_URI + "/");
    });

    it("throws error if uri is empty or null", () => {
        // @ts-ignore
        expect(() => UrlString.canonicalizeUrl(null)).toThrowError();
        expect(() => UrlString.canonicalizeUrl("")).toThrowError();
    });


    it("throws error if uri is not secure", () => {
        const insecureUrlString = "http://login.microsoft.com/common";
        expect(() => UrlString.canonicalizeUrl(insecureUrlString)).toThrowError(
            `${ClientConfigurationErrorMessage.authorityUriInsecure.desc} Given URI: ${insecureUrlString}`
        );
        expect(() => UrlString.canonicalizeUrl(insecureUrlString)).toThrowError(
            ClientConfigurationError
        );
    });

    it("validates any valid URI", () => {
        const urlString = "https://example.com/";
        expect(() => UrlString.canonicalizeUrl(urlString)).not.toThrow();
    });

    it("appendQueryString appends the provided query string", () => {
        const baseUrl = "https://localhost/";
        const queryString = "param1=value1&param2=value2";
        expect(UrlString.appendQueryString(baseUrl, queryString)).toEqual(
            `${baseUrl}?${queryString}`
        );
        expect(
            UrlString.appendQueryString(`${baseUrl}?param3=value3`, queryString)
        ).toEqual(`${baseUrl}?param3=value3&${queryString}`);
        expect(UrlString.appendQueryString(baseUrl, "")).toEqual(baseUrl);
    });

    it("removes hash from url provided", () => {
        const baseUrl = "https://localhost/";
        const fullUrl = baseUrl + "#thisIsATestHash";
        expect(UrlString.removeHashFromUrl(fullUrl)).toBe(baseUrl);
    });

    it("removes empty query string from url provided", () => {
        const baseUrl = "https://localhost/";
        const testUrl = baseUrl + "?";
        const testUrl2 = baseUrl + "?/";
        expect(UrlString.removeHashFromUrl(testUrl)).toBe(baseUrl);
        expect(UrlString.removeHashFromUrl(testUrl2)).toBe(baseUrl);
    });

    it("getHash returns the anchor part of the URL correctly, or nothing if there is no anchor", () => {
        const urlWithHash =
            TEST_URIS.TEST_AUTH_ENDPT + TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH;
        const urlWithHashAndSlash =
            TEST_URIS.TEST_AUTH_ENDPT +
            "#/" +
            TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH.substring(1);
        const urlWithoutHash = TEST_URIS.TEST_AUTH_ENDPT;

        const urlObjWithHash = UrlString.canonicalizeUrl(urlWithHash);
        const urlObjWithHashAndSlash = UrlString.canonicalizeUrl(urlWithHashAndSlash);
        const urlObjWithoutHash = UrlString.canonicalizeUrl(urlWithoutHash);

        expect(urlObjWithHash.hash).toBe(
            TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH.substring(1)
        );
        expect(urlObjWithHashAndSlash.hash).toBe(
            TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH.substring(1)
        );
        expect(urlObjWithoutHash.hash).toHaveLength(0);
    });

    it("getDeserializedResponse returns the hash as a deserialized object", () => {
        const serializedHash = "#param1=value1&param2=value2&param3=value3";
        const deserializedHash = {
            param1: "value1",
            param2: "value2",
            param3: "value3",
        };

        expect(UrlString.getDeserializedResponse(serializedHash)).toEqual(
            deserializedHash
        );
    });

    it("getDeserializedResponse returns empty object if key/value is undefined", () => {
        let serializedHash = "#=value1";
        const deserializedHash = {};
        expect(UrlString.getDeserializedResponse(serializedHash)).toEqual(
            deserializedHash
        );

        serializedHash = "#key1=";
        expect(UrlString.getDeserializedResponse(serializedHash)).toEqual(
            deserializedHash
        );
    });

    it("hashContainsKnownProperties returns true if correct hash is given", () => {
        expect(
            UrlString.hashContainsKnownProperties(
                TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH
            )
        ).toBe(true);
        expect(
            UrlString.hashContainsKnownProperties(
                TEST_HASHES.TEST_SUCCESS_ACCESS_TOKEN_HASH
            )
        ).toBe(true);
        expect(
            UrlString.hashContainsKnownProperties(
                TEST_HASHES.TEST_SUCCESS_CODE_HASH
            )
        ).toBe(true);
        expect(
            UrlString.hashContainsKnownProperties(TEST_HASHES.TEST_ERROR_HASH)
        ).toBe(true);
    });

    it("hashContainsKnownProperties returns false if incorrect hash is given", () => {
        const exampleUnknownHash = "#param1=value1&param2=value2&param3=value3";
        expect(UrlString.hashContainsKnownProperties(exampleUnknownHash)).toBe(
            false
        );
    });

    it("hashContainsKnownProperties returns false if hash does not contain key/value pairs", () => {
        const exampleUnknownHash = "#testPage";
        expect(UrlString.hashContainsKnownProperties(exampleUnknownHash)).toBe(
            false
        );
    });

    describe("getAbsoluteUrl tests", () => {
        it("Returns url provided if it's already absolute", () => {
            const absoluteUrl = "https://localhost:30662";
            expect(
                UrlString.getAbsoluteUrl(absoluteUrl, absoluteUrl + "/testPath")
            ).toBe(absoluteUrl);
        });

        it("Returns absolute url if relativeUrl provided", () => {
            const basePath = "https://localhost:30662";
            const absoluteUrl = "https://localhost:30662/testPath";
            expect(UrlString.getAbsoluteUrl("/testPath", basePath)).toBe(
                absoluteUrl
            );
            expect(UrlString.getAbsoluteUrl("/testPath", basePath + "/")).toBe(
                absoluteUrl
            );
        });

        it("Replaces path if relativeUrl provided and baseUrl contains different path", () => {
            const basePath = "https://localhost:30662/differentPath";
            const expectedUrl = "https://localhost:30662/testPath";
            expect(UrlString.getAbsoluteUrl("/testPath", basePath)).toBe(
                expectedUrl
            );
        });
    });

    describe("canonicalizeUri tests", () => {
        it("returns empty string if passed", () => {
            const url = "";

            const canonicalUrl = UrlString.canonicalizeUrl(url);

            expect(canonicalUrl).toEqual(url);
        });

        it("handles ?", () => {
            let url = "https://contoso.com/?";

            const canonicalUrl = UrlString.canonicalizeUrl(url);

            expect(canonicalUrl).toEqual("https://contoso.com/");
        });

        it("handles ?/", () => {
            let url = "https://contoso.com/?/";

            const canonicalUrl = UrlString.canonicalizeUrl(url);

            expect(canonicalUrl).toEqual("https://contoso.com/");
        });

        it("maintains original casing of original url", () => {
            let url = "https://contoso.com/PATH";

            const canonicalUrl = UrlString.canonicalizeUrl(url);

            expect(url).toEqual("https://contoso.com/PATH");
            expect(canonicalUrl).toEqual("https://contoso.com/path/");
        });
    });
});
