const nUSD = artifacts.require('./nUSD.sol');
const ethers = require('ethers');
const { expectEvent } = require('@openzeppelin/test-helpers');



require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('nUSD', (accounts) => {
    let contract

    before(async () => {
        contract = await nUSD.deployed()
    })

    describe('Deployment', async () => {

        it('Deploys successfully', async () => {
            const address = contract.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('Has a name', async () => {
            const name = await contract.name()
            assert.equal(name, 'Ethereum backed USD pegged stablecoin')
        })

        it('Has a symbol', async () => {
            const symbol = await contract.symbol()
            assert.equal(symbol, 'nUSD')
        })

        it('Has 18 Decimals', async () => {
            const decimals = await contract.decimals()
            assert.equal(decimals, 8)
        })

    })


    describe('Transfers', async () => {

        it('Transfer', async () => {
            await contract.depositETH( { from: accounts[0] , value: '2000000000000000000'})
            await contract.transfer(accounts[5], '10000000000', { from: accounts[0] })  //100 ethers
            const balance = await contract.balanceOf(accounts[5])
            assert.equal(balance, '10000000000')
        })

        it('Transfer with insufficient balance revert expected', async () => {
            await contract.transfer(accounts[5], '10000000000000000000000', { from: accounts[2] }).should.be.rejected  //100 ethers
        })

        it('Transfer From', async () => {
            await contract.approve(accounts[1], '10000000000', { from: accounts[0] })   //100 ethers
            await contract.transferFrom(accounts[0], accounts[6], '10000000000', { from: accounts[1] })
            const balance = await contract.balanceOf(accounts[6])
            assert.equal(balance, '10000000000')
        })

        it('Transfer From with insufficient balance revert expected', async () => {
            await contract.approve(accounts[1], '100000000000000000000', { from: accounts[2] })   //100 ethers
            await contract.transferFrom(accounts[2], accounts[5], '100000000000000000000', { from: accounts[1] }).should.be.rejected
        })

        it('Transfer From without approval revert expected', async () => {
            //await contract.approve(accounts[1],'100000000000000000000',{from:accounts[0]})   //100 ethers
            await contract.transferFrom(accounts[0], accounts[5], '100000000000000000000', { from: accounts[1] }).should.be.rejected
            const balance = await contract.balanceOf(accounts[5])
            assert.equal(balance, '10000000000')
        })

    })

    describe('Approval and Allowances', async () => {
        it('Approve Spender', async () => {
            await contract.approve(accounts[2], '100000000000000000000', { from: accounts[0] })   //100 ethers
            const allowance = await contract.allowance(accounts[0], accounts[2])
            assert.equal(allowance, '100000000000000000000')
        })

        it('Approval to zero address revert expected', async () => {
            await contract.approve(ethers.constants.AddressZero, '100000000000000000000', { from: accounts[0] }).should.be.rejected   //100 ethers
        })

        it('Approval from zero address revert expected', async () => {
            await contract.approve(accounts, '100000000000000000000', { from: ethers.constants.AddressZero }).should.be.rejected   //100 ethers
        })

        it('Increase allowance for Spender', async () => {
            await contract.increaseAllowance(accounts[2], '100000000000000000000', { from: accounts[0] })   //100 ethers
            const allowance = await contract.allowance(accounts[0], accounts[2])
            assert.equal(allowance, '200000000000000000000')
        })

        it('Decrease allowance for Spender', async () => {
            await contract.decreaseAllowance(accounts[2], '100000000000000000000', { from: accounts[0] })   //100 ethers
            const allowance = await contract.allowance(accounts[0], accounts[2])
            assert.equal(allowance, '100000000000000000000')
        })

    })

    describe('Burning tokens', async () => {

        it('Burn', async () => {
            const receipt = await contract.burn('10000000000', { from: accounts[0] })
            expectEvent(receipt, 'Transfer', { to: ethers.constants.AddressZero, value: '10000000000' });
        })

        it('Burns with insufficient balance revert expected', async () => {
            await contract.burn('100000000000000000000', { from: accounts[7] }).should.be.rejected
        })

        it('Burn From without approval revert expected', async () => {
            await contract.burnFrom('100000000000000000000', { from: accounts[5] }).should.be.rejected
        })

        it('Burn From with insufficient balance revert expected', async () => {
            await contract.burnFrom(accounts[7], '100000000000000000000', { from: accounts[5] }).should.be.rejected
        })

        it('Burn From', async () => {
            await contract.approve(accounts[4], '10000000000', { from: accounts[5] })   //100 ethers
            const receipt = await contract.burnFrom(accounts[5], '10000000000', { from: accounts[4] })
            expectEvent(receipt, 'Transfer', { to: ethers.constants.AddressZero });
        })

    })

    describe('Getter Functions', async () => {

        it('Gets balance of a given address', async () => {
            assert.equal(await contract.balanceOf(accounts[5]), '10000000000')
        })

    })

})
