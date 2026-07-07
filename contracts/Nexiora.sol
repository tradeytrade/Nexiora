// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Nexiora ($NXIO)
/// @notice Fixed-supply ERC-20. The full supply is minted once to `recipient`
///         at deployment. There is no owner, no mint, no pause, no blacklist:
///         the token is immutable after deployment.
contract Nexiora is ERC20 {
    constructor(address recipient, uint256 supply) ERC20("Nexiora", "NXIO") {
        require(recipient != address(0), "recipient is zero address");
        _mint(recipient, supply);
    }
}
