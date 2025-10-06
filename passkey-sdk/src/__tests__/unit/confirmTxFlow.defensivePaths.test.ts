import { test, expect } from '@playwright/test';
import { setupBasicPasskeyTest } from '../setup';

const IMPORT_PATHS = {
  handle: '/sdk/esm/core/WebAuthnManager/SignerWorkerManager/confirmTxFlow/handleSecureConfirmRequest.js',
  types: '/sdk/esm/core/WebAuthnManager/SignerWorkerManager/confirmTxFlow/types.js',
  events: '/sdk/esm/core/WalletIframe/events.js',
} as const;

test.describe('confirmTxFlow – defensive paths', () => {
  test.beforeEach(async ({ page }) => {
    await setupBasicPasskeyTest(page);
  });

  test('Signing flow: cancel releases reserved nonces', async ({ page }) => {
    const result = await page.evaluate(async ({ paths }) => {
      const mod = await import(paths.handle);
      const types = await import(paths.types);
      const events = await import(paths.events);
      const handle = mod.handlePromptUserConfirmInJsMainThread as Function;

      const reserved: string[] = [];
      const released: string[] = [];
      const ctx: any = {
        userPreferencesManager: {
          getConfirmationConfig: () => ({
            uiMode: 'modal',
            behavior: 'requireClick',
            autoProceedDelay: 0,
            theme: 'dark'
          }),
        },
        iframeModeDefault: false,
        nonceManager: {
          async getNonceBlockHashAndHeight() {
            return {
              nearPublicKeyStr: 'pk',
              accessKeyInfo: { nonce: 300 },
              nextNonce: '301',
              txBlockHeight: '3000',
              txBlockHash: 'h3000',
            };
          },
          reserveNonces(count: number) {
            const values = Array.from({ length: count }, (_, i) => String(301 + i));
            reserved.push(...values);
            return values;
          },
          releaseNonce(nonce: string) {
            released.push(nonce);
          },
        },
        nearClient: {},
        vrfWorkerManager: {
          async generateVrfChallenge({ blockHeight, blockHash }: any) {
            return { vrfOutput: 'out', vrfProof: 'proof', blockHeight, blockHash };
          },
        },
        touchIdPrompt: {
          getRpId: () => 'example.localhost',
          getAuthenticationCredentialsInternal: async () => ({}) as any,
        },
        indexedDB: { clientDB: { getAuthenticatorsByUser: async () => [] } },
      };

      const request = {
        schemaVersion: 2,
        requestId: 'cancel-sign',
        type: types.SecureConfirmationType.SIGN_TRANSACTION,
        summary: {},
        payload: {
          intentDigest: 'intent-sign-cancel',
          nearAccountId: 'cancel.testnet',
          txSigningRequests: [{ receiverId: 'x', actions: [] }],
          rpcCall: {
            method: 'sign',
            argsJson: {},
            nearAccountId: 'cancel.testnet',
            contractId: 'web3-authn.testnet',
            nearRpcUrl: 'https://rpc.testnet.near.org',
          },
        },
      } as any;

      const workerMessages: any[] = [];
      const worker = { postMessage: (msg: any) => workerMessages.push(msg) } as unknown as Worker;

      const triggerCancel = () => {
        const attempt = () => {
          const portal = document.getElementById('w3a-confirm-portal');
          const host = portal?.firstElementChild as HTMLElement | null;
          if (host) {
            host.dispatchEvent(new CustomEvent(
              events.WalletIframeDomEvents.TX_CONFIRMER_CANCEL,
              { bubbles: true, composed: true } as any
            ));
          } else {
            setTimeout(attempt, 20);
          }
        };
        setTimeout(attempt, 60);
      };

      triggerCancel();
      await handle(ctx, {
        type: types.SecureConfirmMessageType.PROMPT_USER_CONFIRM_IN_JS_MAIN_THREAD,
        data: request
      }, worker);
      const response = workerMessages[0]?.data;
      return { reserved, released, response };
    }, { paths: IMPORT_PATHS });

    expect(result.reserved.length).toBeGreaterThan(0);
    expect(result.released).toEqual(result.reserved);
    expect(result.response.confirmed).toBe(false);
  });

  test('Registration flow: cancel releases reserved nonces', async ({ page }) => {
    const result = await page.evaluate(async ({ paths }) => {
      const mod = await import(paths.handle);
      const types = await import(paths.types);
      const events = await import(paths.events);
      const handle = mod.handlePromptUserConfirmInJsMainThread as Function;

      const reserved: string[] = [];
      const released: string[] = [];
      const ctx: any = {
        userPreferencesManager: {
          getConfirmationConfig: () => ({
            uiMode: 'modal',
            behavior: 'requireClick',
            autoProceedDelay: 0,
            theme: 'light'
          }),
        },
        iframeModeDefault: false,
        nonceManager: {
          async getNonceBlockHashAndHeight() {
            return {
              nearPublicKeyStr: 'pk-reg',
              accessKeyInfo: { nonce: 10 },
              nextNonce: '11',
              txBlockHeight: '500',
              txBlockHash: 'h500',
            };
          },
          reserveNonces(count: number) {
            const values = Array.from({ length: count }, (_, i) => String(11 + i));
            reserved.push(...values);
            return values;
          },
          releaseNonce(nonce: string) {
            released.push(nonce);
          },
        },
        nearClient: {},
        vrfWorkerManager: {
          async generateVrfKeypairBootstrap({ vrfInputData }: any) {
            return {
              vrfChallenge: {
                vrfOutput: 'bootstrap-out',
                vrfProof: 'bootstrap-proof',
                blockHeight: vrfInputData.blockHeight,
                blockHash: vrfInputData.blockHash,
              },
              vrfPublicKey: 'vrf-pk',
            };
          },
        },
        touchIdPrompt: {
          getRpId: () => 'example.localhost',
          generateRegistrationCredentialsInternal: async () => ({}) as any,
        },
        indexedDB: { clientDB: { getAuthenticatorsByUser: async () => [] } },
      };

      const request = {
        schemaVersion: 2,
        requestId: 'cancel-reg',
        type: types.SecureConfirmationType.REGISTER_ACCOUNT,
        summary: {},
        payload: {
          nearAccountId: 'cancel-reg.testnet',
          rpcCall: { method: 'register', argsJson: {} },
        },
      } as any;

      const workerMessages: any[] = [];
      const worker = { postMessage: (msg: any) => workerMessages.push(msg) } as unknown as Worker;

      const triggerCancel = () => {
        const attempt = () => {
          const portal = document.getElementById('w3a-confirm-portal');
          const host = portal?.firstElementChild as HTMLElement | null;
          if (host) {
            host.dispatchEvent(new CustomEvent(
              events.WalletIframeDomEvents.TX_CONFIRMER_CANCEL,
              { bubbles: true, composed: true } as any
            ));
          } else {
            setTimeout(attempt, 20);
          }
        };
        setTimeout(attempt, 60);
      };

      triggerCancel();
      await handle(ctx, {
        type: types.SecureConfirmMessageType.PROMPT_USER_CONFIRM_IN_JS_MAIN_THREAD,
        data: request
      }, worker);
      const response = workerMessages[0]?.data;
      return { reserved, released, response };
    }, { paths: IMPORT_PATHS });

    expect(result.reserved.length).toBeGreaterThan(0);
    expect(result.released).toEqual(result.reserved);
    expect(result.response.confirmed).toBe(false);
  });

  test('SHOW_SECURE_PRIVATE_KEY_UI keeps viewer mounted and returns confirmed', async ({ page }) => {
    const result = await page.evaluate(async ({ paths }) => {
      const mod = await import(paths.handle);
      const types = await import(paths.types);
      const handle = mod.handlePromptUserConfirmInJsMainThread as Function;

      const ctx: any = {
        userPreferencesManager: {
          getConfirmationConfig: () => ({
            uiMode: 'drawer',
            behavior: 'requireClick',
            autoProceedDelay: 0,
            theme: 'dark'
          }),
        },
        iframeModeDefault: true,
        nonceManager: {
          getNonceBlockHashAndHeight: async () => ({
            nearPublicKeyStr: '',
            accessKeyInfo: { nonce: 0 },
            nextNonce: '0',
            txBlockHeight: '1',
            txBlockHash: 'h1'
           }),
          reserveNonces: () => [],
          releaseNonce: () => {},
        },
        nearClient: {
          viewBlock: async () => ({ header: { height: 1, hash: 'h1' } }),
        },
        vrfWorkerManager: {
          generateVrfChallenge: async ({ blockHeight, blockHash }: any) => ({
            vrfOutput: 'out',
            vrfProof: 'proof',
            blockHeight,
            blockHash
          }),
        },
        touchIdPrompt: {
          getRpId: () => 'example.localhost',
        },
        indexedDB: { clientDB: { getAuthenticatorsByUser: async () => [] } },
      };

      const request = {
        schemaVersion: 2,
        requestId: 'show-key',
        type: types.SecureConfirmationType.SHOW_SECURE_PRIVATE_KEY_UI,
        summary: {},
        payload: {
          nearAccountId: 'viewer.testnet',
          publicKey: 'ed25519:dummy',
          privateKey: 'ed25519:secret',
        },
      } as any;

      const workerMessages: any[] = [];
      const worker = { postMessage: (msg: any) => workerMessages.push(msg) } as unknown as Worker;

      await handle(ctx, {
        type: types.SecureConfirmMessageType.PROMPT_USER_CONFIRM_IN_JS_MAIN_THREAD,
        data: request
      }, worker);
      const response = workerMessages[0]?.data;
      const viewer = document.querySelector('w3a-export-viewer-iframe');
      const stillMounted = !!viewer;
      viewer?.remove();
      return { confirmed: response?.confirmed, stillMounted };
    }, { paths: IMPORT_PATHS });

    expect(result.confirmed).toBe(true);
    expect(result.stillMounted).toBe(true);
  });

  test('Signing flow: missing PRF output surfaces error', async ({ page }) => {
    const result = await page.evaluate(async ({ paths }) => {
      const mod = await import(paths.handle);
      const types = await import(paths.types);
      const handle = mod.handlePromptUserConfirmInJsMainThread as Function;

      const ctx: any = {
        userPreferencesManager: {
          getConfirmationConfig: () => ({
            uiMode: 'skip',
            behavior: 'autoProceed',
            autoProceedDelay: 0,
            theme: 'dark'
          }),
        },
        iframeModeDefault: false,
        nonceManager: {
          async getNonceBlockHashAndHeight() {
            return {
              nearPublicKeyStr: 'pk',
              accessKeyInfo: { nonce: 400 },
              nextNonce: '401',
              txBlockHeight: '4000',
              txBlockHash: 'h4000',
            };
          },
          reserveNonces: () => ['401'],
          releaseNonce: () => {},
        },
        nearClient: {},
        vrfWorkerManager: {
          async generateVrfChallenge({ blockHeight, blockHash }: any) {
            return { vrfOutput: 'out', vrfProof: 'proof', blockHeight, blockHash };
          },
        },
        touchIdPrompt: {
          getRpId: () => 'example.localhost',
          getAuthenticationCredentialsInternal: async () => ({
            id: 'cred',
            type: 'public-key',
            rawId: new Uint8Array([1]).buffer,
            response: {
              clientDataJSON: new Uint8Array([1]).buffer,
              authenticatorData: new Uint8Array([2]).buffer,
              signature: new Uint8Array([3]).buffer,
              userHandle: null,
            },
            getClientExtensionResults: () => ({ prf: { results: {} } }),
          }) as any,
        },
        indexedDB: { clientDB: { getAuthenticatorsByUser: async () => [] } },
      };

      const request = {
        schemaVersion: 2,
        requestId: 'prf-fail-sign',
        type: types.SecureConfirmationType.SIGN_TRANSACTION,
        summary: {},
        payload: {
          intentDigest: 'intent-error',
          nearAccountId: 'error.testnet',
          txSigningRequests: [{ receiverId: 'x', actions: [] }],
          rpcCall: {
            method: 'sign',
            argsJson: {},
            nearAccountId: 'error.testnet',
            contractId: 'web3-authn.testnet',
            nearRpcUrl: 'https://rpc.testnet.near.org',
          },
        },
      } as any;

      const workerMessages: any[] = [];
      const worker = { postMessage: (msg: any) => workerMessages.push(msg) } as unknown as Worker;
      let error: string | null = null;
      try {
        await handle(ctx, {
        type: types.SecureConfirmMessageType.PROMPT_USER_CONFIRM_IN_JS_MAIN_THREAD,
        data: request
      }, worker);
      } catch (err: any) {
        error = err?.message || String(err);
      }
      return { error, messageCount: workerMessages.length };
    }, { paths: IMPORT_PATHS });

    expect(result.error).toContain('Missing PRF result');
    expect(result.messageCount).toBe(0);
  });

  test('Registration flow: missing PRF output surfaces error', async ({ page }) => {
    const result = await page.evaluate(async ({ paths }) => {
      const mod = await import(paths.handle);
      const types = await import(paths.types);
      const handle = mod.handlePromptUserConfirmInJsMainThread as Function;

      const ctx: any = {
        userPreferencesManager: {
          getConfirmationConfig: () => ({
            uiMode: 'skip',
            behavior: 'autoProceed',
            autoProceedDelay: 0,
            theme: 'light'
          }),
        },
        iframeModeDefault: false,
        nonceManager: {
          async getNonceBlockHashAndHeight() {
            return {
              nearPublicKeyStr: 'pk-reg',
              accessKeyInfo: { nonce: 22 },
              nextNonce: '23',
              txBlockHeight: '2200',
              txBlockHash: 'h2200',
            };
          },
          reserveNonces: () => ['23'],
          releaseNonce: () => {},
        },
        nearClient: {},
        vrfWorkerManager: {
          async generateVrfKeypairBootstrap({ vrfInputData }: any) {
            return {
              vrfChallenge: {
                vrfOutput: 'bootstrap',
                vrfProof: 'bootstrap-proof',
                blockHeight: vrfInputData.blockHeight,
                blockHash: vrfInputData.blockHash,
              },
              vrfPublicKey: 'vrf-pk',
            };
          },
        },
        touchIdPrompt: {
          getRpId: () => 'example.localhost',
          generateRegistrationCredentialsInternal: async () => ({
            id: 'reg-cred',
            type: 'public-key',
            rawId: new Uint8Array([1]).buffer,
            response: {
              clientDataJSON: new Uint8Array([1]).buffer,
              attestationObject: new Uint8Array([2]).buffer,
              getTransports: () => ['internal'],
            },
            getClientExtensionResults: () => ({ prf: { results: {} } }),
          }) as any,
        },
        indexedDB: { clientDB: { getAuthenticatorsByUser: async () => [] } },
      };

      const request = {
        schemaVersion: 2,
        requestId: 'prf-fail-reg',
        type: types.SecureConfirmationType.REGISTER_ACCOUNT,
        summary: {},
        payload: {
          nearAccountId: 'error-reg.testnet',
          rpcCall: { method: 'register', argsJson: {} },
        },
      } as any;

      const workerMessages: any[] = [];
      const worker = { postMessage: (msg: any) => workerMessages.push(msg) } as unknown as Worker;
      let error: string | null = null;
      try {
        await handle(ctx, {
        type: types.SecureConfirmMessageType.PROMPT_USER_CONFIRM_IN_JS_MAIN_THREAD,
        data: request
      }, worker);
      } catch (err: any) {
        error = err?.message || String(err);
      }
      return { error, messageCount: workerMessages.length };
    }, { paths: IMPORT_PATHS });

    expect(result.error).toContain('Missing PRF result');
    expect(result.messageCount).toBe(0);
  });
});
