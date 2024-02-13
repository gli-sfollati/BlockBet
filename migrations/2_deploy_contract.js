const Roulette = artifacts.require("Roulette.sol")
const Profile = artifacts.require("Profile.sol")
module.exports = function(deployer) {
  deployer.deploy(Roulette);
  deployer.deploy(Profile);
}