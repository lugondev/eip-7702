export const EIP7702StatelessDelegatorABI = [
  {
    "inputs": [
      {
        "internalType": "contract IDelegationManager",
        "name": "_delegationManager",
        "type": "address"
      },
      {
        "internalType": "contract IEntryPoint",
        "name": "_entryPoint",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "delegationManager",
    "outputs": [
      {
        "internalType": "contract IDelegationManager",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "entryPoint",
    "outputs": [
      {
        "internalType": "contract IEntryPoint",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "callData",
            "type": "bytes"
          }
        ],
        "internalType": "struct Execution",
        "name": "_execution",
        "type": "tuple"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "ModeCode",
        "name": "_mode",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_executionCalldata",
        "type": "bytes"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "ModeCode",
        "name": "_mode",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_executionCalldata",
        "type": "bytes"
      }
    ],
    "name": "executeFromExecutor",
    "outputs": [
      {
        "internalType": "bytes[]",
        "name": "returnData_",
        "type": "bytes[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes[]",
        "name": "_permissionContexts",
        "type": "bytes[]"
      },
      {
        "internalType": "ModeCode[]",
        "name": "_modes",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes[]",
        "name": "_executionCallDatas",
        "type": "bytes[]"
      }
    ],
    "name": "redeemDelegations",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "_interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;
