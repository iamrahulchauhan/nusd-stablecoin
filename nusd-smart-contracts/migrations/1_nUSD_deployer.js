const nUSD = artifacts.require("nUSD");

module.exports = async function (deployer) {
    await deployer.deploy(nUSD);
};
