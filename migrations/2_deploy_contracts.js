var CarVinTracking = artifacts.require("./CarVinTracking.sol");

module.exports = function(deployer) {
  deployer.deploy(CarVinTracking);
};
