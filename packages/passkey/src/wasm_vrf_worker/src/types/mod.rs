use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

pub mod http;
pub mod worker_messages;

// Re-export worker_messages types
pub use worker_messages::*;

// === TYPE DEFINITIONS ===

#[derive(Serialize, Deserialize)]
pub struct VRFKeypairData {
    /// Bincode-serialized ECVRFKeyPair (includes both private key and public key)
    pub keypair_bytes: Vec<u8>,
    /// Base64url-encoded public key for convenience
    pub public_key_base64: String,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct EncryptedVRFKeypair {
    #[wasm_bindgen(getter_with_clone, js_name = "encryptedVrfDataB64u")]
    #[serde(rename = "encryptedVrfDataB64u")]
    pub encrypted_vrf_data_b64u: String,
    #[wasm_bindgen(getter_with_clone, js_name = "chacha20NonceB64u")]
    #[serde(rename = "chacha20NonceB64u")]
    pub chacha20_nonce_b64u: String,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct VRFInputData {
    #[wasm_bindgen(getter_with_clone, js_name = "userId")]
    #[serde(rename = "userId")]
    pub user_id: String,
    #[wasm_bindgen(getter_with_clone, js_name = "rpId")]
    #[serde(rename = "rpId")]
    pub rp_id: String,
    #[wasm_bindgen(getter_with_clone, js_name = "blockHeight")]
    #[serde(rename = "blockHeight")]
    pub block_height: String,
    #[wasm_bindgen(getter_with_clone, js_name = "blockHash")]
    #[serde(rename = "blockHash")]
    pub block_hash: String,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VRFChallengeData {
    #[wasm_bindgen(getter_with_clone, js_name = "vrfInput")]
    #[serde(rename = "vrfInput")]
    pub vrf_input: String,
    #[wasm_bindgen(getter_with_clone, js_name = "vrfOutput")]
    #[serde(rename = "vrfOutput")]
    pub vrf_output: String,
    #[wasm_bindgen(getter_with_clone, js_name = "vrfProof")]
    #[serde(rename = "vrfProof")]
    pub vrf_proof: String,
    #[wasm_bindgen(getter_with_clone, js_name = "vrfPublicKey")]
    #[serde(rename = "vrfPublicKey")]
    pub vrf_public_key: String,
    #[wasm_bindgen(getter_with_clone, js_name = "userId")]
    #[serde(rename = "userId")]
    pub user_id: String,
    #[wasm_bindgen(getter_with_clone, js_name = "rpId")]
    #[serde(rename = "rpId")]
    pub rp_id: String,
    #[wasm_bindgen(getter_with_clone, js_name = "blockHeight")]
    #[serde(rename = "blockHeight")]
    pub block_height: String,
    #[wasm_bindgen(getter_with_clone, js_name = "blockHash")]
    #[serde(rename = "blockHash")]
    pub block_hash: String,
}
impl VRFChallengeData {
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::to_value(self).unwrap()
    }
}

#[derive(Serialize, Deserialize)]
pub struct GenerateVrfKeypairBootstrapResponse {
    pub vrf_public_key: String,
    pub vrf_challenge_data: Option<VRFChallengeData>,
}

#[derive(Serialize, Deserialize)]
pub struct EncryptedVrfKeypairResponse {
    pub vrf_public_key: String,
    pub encrypted_vrf_keypair: EncryptedVRFKeypair,
}


