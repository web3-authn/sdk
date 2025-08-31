import { AccountId } from "./accountIds";

// === TRANSACTION INPUT INTERFACES ===

export interface TransactionInput {
  receiverId: string;
  actions: ActionArgs[],
}

export interface TransactionInputWasm {
  receiverId: string;
  actions: ActionArgsWasm[],
  nonce?: string; // Optional - computed in confirmation flow if not provided
}

/**
 * Enum for all supported NEAR action types
 * Provides type safety and better developer experience
 */
export enum ActionType {
  CreateAccount = "CreateAccount",
  DeployContract = "DeployContract",
  FunctionCall = "FunctionCall",
  Transfer = "Transfer",
  Stake = "Stake",
  AddKey = "AddKey",
  DeleteKey = "DeleteKey",
  DeleteAccount = "DeleteAccount",
}

export enum TxExecutionStatus {
  NONE = 'NONE',
  INCLUDED = 'INCLUDED',
  INCLUDED_FINAL = 'INCLUDED_FINAL',
  EXECUTED = 'EXECUTED',
  FINAL = 'FINAL',
  EXECUTED_OPTIMISTIC = 'EXECUTED_OPTIMISTIC'
}

// === ACTION INTERFACES (camelCase for JS) ===

export interface FunctionCallAction {
  type: ActionType.FunctionCall;
  /** Name of the contract method to call */
  methodName: string;
  /** Arguments to pass to the method (will be JSON.stringify'd automatically) */
  args: Record<string, any>;
  /** Maximum gas to use for this call (default: '30000000000000' 30 TGas) */
  gas?: string;
  /** Amount of NEAR tokens to attach in yoctoNEAR (default: '0') */
  deposit?: string;
}

export interface TransferAction {
  type: ActionType.Transfer;
  /** Amount of NEAR tokens to transfer in yoctoNEAR */
  amount: string;
}

export interface CreateAccountAction {
  type: ActionType.CreateAccount;
}

export interface DeployContractAction {
  type: ActionType.DeployContract;
  /** Contract code as Uint8Array or base64 string */
  code: Uint8Array | string;
}

export interface StakeAction {
  type: ActionType.Stake;
  /** Amount to stake in yoctoNEAR */
  stake: string;
  /** Public key of the validator */
  publicKey: string;
}

export interface AddKeyAction {
  type: ActionType.AddKey;
  /** Public key to add */
  publicKey: string;
  /** Access key configuration */
  accessKey: {
    /** Starting nonce for the key */
    nonce?: number;
    /** Permission level for the key */
    permission: 'FullAccess' | {
      /** Function call permissions */
      FunctionCall: {
        /** Maximum allowance in yoctoNEAR (optional for unlimited) */
        allowance?: string;
        /** Contract that can be called (default: same as receiverId) */
        receiverId?: string;
        /** Method names that can be called (empty array = all methods) */
        methodNames?: string[];
      };
    };
  };
}

export interface DeleteKeyAction {
  type: ActionType.DeleteKey;
  /** Public key to remove */
  publicKey: string;
}

export interface DeleteAccountAction {
  type: ActionType.DeleteAccount;
  /** Account that will receive the remaining balance */
  beneficiaryId: string;
}

/**
 * Action types for all NEAR actions
 * camelCase for JS
 */
export type ActionArgs =
  | FunctionCallAction
  | TransferAction
  | CreateAccountAction
  | DeployContractAction
  | StakeAction
  | AddKeyAction
  | DeleteKeyAction
  | DeleteAccountAction;

// === ACTION TYPES ===

// ActionArgsWasm matches the Rust enum structure exactly
// snake_case for wasm
export type ActionArgsWasm =
  | { action_type: ActionType.CreateAccount }
  | { action_type: ActionType.DeployContract; code: number[] }
  | {
      action_type: ActionType.FunctionCall;
      method_name: string;
      args: string; // JSON string, not object
      gas: string;
      deposit: string;
    }
  | { action_type: ActionType.Transfer; deposit: string }
  | { action_type: ActionType.Stake; stake: string; public_key: string }
  | { action_type: ActionType.AddKey; public_key: string; access_key: string }
  | { action_type: ActionType.DeleteKey; public_key: string }
  | { action_type: ActionType.DeleteAccount; beneficiary_id: string }

export function isActionArgsWasm(a?: any): a is ActionArgsWasm {
  return a && typeof a === 'object' && 'action_type' in a
}

export function toActionArgsWasm(action: ActionArgs): ActionArgsWasm {
  switch (action.type) {
    case ActionType.Transfer:
      return {
        action_type: ActionType.Transfer,
        deposit: action.amount
      };

    case ActionType.FunctionCall:
      return {
        action_type: ActionType.FunctionCall,
        method_name: action.methodName,
        args: JSON.stringify(action.args),
        gas: action.gas || "30000000000000",
        deposit: action.deposit || "0"
      };

    case ActionType.AddKey:
      // Ensure access key has proper format with nonce and permission object
      const accessKey = {
        nonce: action.accessKey.nonce || 0,
        permission: action.accessKey.permission === 'FullAccess'
          ? { FullAccess: {} }
          : action.accessKey.permission // For FunctionCall permissions, pass as-is
      };
      return {
        action_type: ActionType.AddKey,
        public_key: action.publicKey,
        access_key: JSON.stringify(accessKey)
      };

    case ActionType.DeleteKey:
      return {
        action_type: ActionType.DeleteKey,
        public_key: action.publicKey
      };

    case ActionType.CreateAccount:
      return {
        action_type: ActionType.CreateAccount
      };

    case ActionType.DeleteAccount:
      return {
        action_type: ActionType.DeleteAccount,
        beneficiary_id: action.beneficiaryId
      };

    case ActionType.DeployContract:
      return {
        action_type: ActionType.DeployContract,
        code: typeof action.code === 'string'
          ? Array.from(new TextEncoder().encode(action.code))
          : Array.from(action.code)
      };

    case ActionType.Stake:
      return {
        action_type: ActionType.Stake,
        stake: action.stake,
        public_key: action.publicKey
      };

    default:
      throw new Error(`Action type ${(action as any).type} is not supported`);
  }
}

// === ACTION TYPE VALIDATION ===

/**
 * Validate action parameters before sending to worker
 */
export function validateActionArgsWasm(actionArgsWasm: ActionArgsWasm): void {
  switch (actionArgsWasm.action_type) {
    case ActionType.FunctionCall:
      if (!actionArgsWasm.method_name) {
        throw new Error('method_name required for FunctionCall');
      }
      if (!actionArgsWasm.args) {
        throw new Error('args required for FunctionCall');
      }
      if (!actionArgsWasm.gas) {
        throw new Error('gas required for FunctionCall');
      }
      if (!actionArgsWasm.deposit) {
        throw new Error('deposit required for FunctionCall');
      }
      // Validate args is valid JSON string
      try {
        JSON.parse(actionArgsWasm.args);
      } catch {
        throw new Error('FunctionCall action args must be valid JSON string');
      }
      break;
    case ActionType.Transfer:
      if (!actionArgsWasm.deposit) {
        throw new Error('deposit required for Transfer');
      }
      break;
    case ActionType.CreateAccount:
      // No additional validation needed
      break;
    case ActionType.DeployContract:
      if (!actionArgsWasm.code || actionArgsWasm.code.length === 0) {
        throw new Error('code required for DeployContract');
      }
      break;
    case ActionType.Stake:
      if (!actionArgsWasm.stake) {
        throw new Error('stake amount required for Stake');
      }
      if (!actionArgsWasm.public_key) {
        throw new Error('public_key required for Stake');
      }
      break;
    case ActionType.AddKey:
      if (!actionArgsWasm.public_key) {
        throw new Error('public_key required for AddKey');
      }
      if (!actionArgsWasm.access_key) {
        throw new Error('access_key required for AddKey');
      }
      break;
    case ActionType.DeleteKey:
      if (!actionArgsWasm.public_key) {
        throw new Error('public_key required for DeleteKey');
      }
      break;
    case ActionType.DeleteAccount:
      if (!actionArgsWasm.beneficiary_id) {
        throw new Error('beneficiary_id required for DeleteAccount');
      }
      break;
    default:
      throw new Error(`Unsupported action type: ${(actionArgsWasm as any).action_type}`);
  }
}