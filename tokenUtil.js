var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://40.68.174.13')); //change as per project
var Client = require('node-rest-client').Client;  //
var client = new Client();

var User = require('./../models/User'); //User model which is moongose schema
var WalletTypeEnum = require('./../enums/WalletTypeEnum');


var CryptoTypeEnum = require('./../enums/CryptoTypeEnum');
var TokenUtil = function Constructor() {

};

var config = require('./../config');

//0x27e78277915C5890eA25a0B941afce4398513d72

var decimals = 18;//For Precision of Total Remaining Tokens 
var addressForContract = config.AdminSmartContractAddress;//'0x02071dBf1D086a6346eff413354fDB93EA9A1eC8';//'0x54e20FEa922dF728dAf9701c704e52018c70edf9';  //Live network
var Contract = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferByOwnerContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"timeForLockingPeriod","type":"uint256"}],"name":"updateUserAbleToTransferTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
).at(addressForContract);


/**
 * This function will be called from outside of class and is used to transfer tokens 
 */
TokenUtil.prototype.transferToken = function (addressFrom, passwordUnlock, addressToTransfer, totalTokens) {
    try {
        var isUnlocked = web3.personal.unlockAccount(addressFrom, passwordUnlock, 100);
        totalTokens = totalTokens * Math.pow(10, decimals);
        var tokenTransferRes = Contract.transfer.sendTransaction(addressToTransfer, totalTokens, {
            from: addressFrom
        });
        return tokenTransferRes;
    } catch (err) {
        console.log(err);
        return err;
    }
}
var adminETH = config.AdminEthFundAddress;
console.log(adminETH);
/**
 * This is watcher whhich will automatically detect new transaction on client reciever adress and will transfer tokens to sender
 */
var filter = web3.eth.filter('latest');
filter.watch(function (error, result) {
    if (!error) {
        var block = web3.eth.getBlock(result);
        for (var i = 0; i < block.transactions.length; i++) {
            var transaction = web3.eth.getTransaction(block.transactions[i]);
            var toAddr = transaction.to;
            if (toAddr === adminETH) {
                var amount = web3.fromWei(transaction.value, 'ether');
                var from = transaction.from;
                var urlEthToUSD = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD";
                client.get(urlEthToUSD, function (data, resp) {
                    var price = data.USD;
                    var now = Math.floor(new Date());
                    var totalUSD = parseFloat(amount) * price;
                    var tokenRemaining = TokensOfAddress(global.AdminEthAddress);
                    var tokens = 82999995 - tokenRemaining;
                    var bonus = 0;
                    if (tokens < 20000000) {
                        bonus = 40;
                    }
                    else if (tokens < 30000000) {
                        bonus = 20;
                    }
                    else if (tokens < 50000000) {
                        bonus = 10;
                    }
                    else if (tokens <= 70000000) {
                        bonus = 5;
                    }

                    var tokensToTransfer = (totalUSD / global.rateForToken);
                    bonus = (tokensToTransfer * bonus) / 100;
                    tokensToTransfer = tokensToTransfer + bonus;
                    transferTokenETH(global.AdminEthAddress, global.AdminEthPassword, from, tokensToTransfer);
                    from = from.toUpperCase();
                    User.findOne({
                        'EthAddress': from
                    }, function (err, user) {
                        if (user) {
                            if (user.Email) {
                                emailTOUser(user, tokensToTransfer);
                            }
                            user.WalletType = WalletTypeEnum.ETHEREUM;
                            user.AmountInvested = amount;
                            user.Tokens = tokensToTransfer;
                            user.save();
                        }
                        else {
                            user = new User();
                            user.EthAddress = from;
                            user.AmountInvested = amount;
                            user.WalletType = WalletTypeEnum.ETHEREUM;
                            user.Tokens = tokensToTransfer;
                            user.save(function (err, res) {
                                if (err) {
                                    console.log(err);
                                }
                                else {

                                }
                            });
                        }
                    });//end of function
                });
            }
        }
    }
    else {
        console.log(error);
    }
});

function transferTokenETH(addressFrom, passwordUnlock, addressToTransfer, totalTokens) {
    try {
        var isUnlocked = web3.personal.unlockAccount(addressFrom, passwordUnlock, 15000);
        totalTokens = totalTokens * Math.pow(10, decimals);
        var tokenTransferRes = Contract.transfer.sendTransaction(addressToTransfer, totalTokens, {
            from: addressFrom
        });
        return tokenTransferRes;
    } catch (err) {
        console.log(err);
        return err;
    }
}

TokenUtil.prototype.etherOf = function (addressForBalance) {
    var balanceOfAddres = Contract.etherOf.call(addressForBalance, {
        from: addressForBalance
    });
    var bal = web3.fromWei(balanceOfAddres, 'ether');
    return bal;
}
TokenUtil.prototype.balanceOf = function (addressForBalance) {
    var balanceOfAddres = Contract.balanceOf.call(addressForBalance, {
        from: addressForBalance
    });
    balanceOfAddres = balanceOfAddres / Math.pow(10, decimals);
    return balanceOfAddres;
}

TokenUtil.prototype.totalSupply = function () {
    var balanceOfAddres = Contract.totalSupply.call();
    balanceOfAddres = balanceOfAddres / Math.pow(10, decimals);
    return balanceOfAddres;
}


TokenUtil.prototype.getBalance = function (address) {
    var balance = web3.fromWei(web3.eth.getBalance(address), "ether");

    return balance;
}

TokenUtil.prototype.getTokenRemain = function (address) {
    var balance = Contract.balanceOf.call(address, {
        from: address
    });
    balance = balance / Math.pow(10, decimals);
    return balance;
}

function TokensOfAddress(addressForBalance) {
    var balanceOfAddres = Contract.balanceOf.call(addressForBalance, {
        from: addressForBalance
    });
    balanceOfAddres = balanceOfAddres / Math.pow(10, decimals);
    return balanceOfAddres;
}

function transferTokensCall(addressFrom, passwordUnlock, addressToTransfer, totalTokens) {
    try {
        var isUnlocked = web3.personal.unlockAccount(addressFrom, passwordUnlock, 15000);
        totalTokens = totalTokens * Math.pow(10, decimals);
        var tokenTransferRes = Contract.transfer.sendTransaction(addressToTransfer, totalTokens, {
            from: addressFrom
        });
        return tokenTransferRes;
    } catch (err) {
        console.log(err);
        return err;
    }
}

TokenUtil.prototype.transferTokensForPrivateSale = function (userEthAddr, totalUSD) {
    var tokenRemaining = TokensOfAddress(global.AdminEthAddress);
    var tokens = 82999995 - tokenRemaining;
    var bonus = 0;
    if (tokens < 20000000) {
        bonus = 40;
    }
    else if (tokens < 30000000) {
        bonus = 20;
    }
    else if (tokens < 50000000) {
        bonus = 10;
    }
    else if (tokens <= 70000000) {
        bonus = 5;
    }

    var tokensToTransfer = (totalUSD / global.rateForToken);
    bonus = (tokensToTransfer * bonus) / 100;
    tokensToTransfer = tokensToTransfer + bonus;

    var transHash = transferTokensCall(global.AdminEthAddress, global.AdminEthPassword, userEthAddr, tokensToTransfer);
    return transHash;

}//end of transferTokensForPrivateSale


TokenUtil.prototype.transferTokensForUSD = function (user, transMoney, TYPE, callbackNext) {
    var urlBtcToUSD = "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD";
    var urlLtcToUSD = "https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=USD";
    var url = "";
    var currencyStr = "";
    if (TYPE == CryptoTypeEnum.LITECOIN) {
        url = urlLtcToUSD;
        currencyStr = " LTC";
    }
    else {
        url = urlBtcToUSD;
        currencyStr = " BTC";
    }
    client.get(url, function (data, resp) {
        var price = data.USD;
        var totalUSD = parseFloat(transMoney) * price;
        var tokenRemaining = TokensOfAddress(global.AdminEthAddress);
        var tokens = 82999995 - tokenRemaining;
        var bonus = 0;
        if (tokens < 20000000) {
            bonus = 40;
        }
        else if (tokens < 30000000) {
            bonus = 20;
        }
        else if (tokens < 50000000) {
            bonus = 10;
        }
        else if (tokens <= 70000000) {
            bonus = 5;
        }

        var tokensToTransfer = (totalUSD / global.rateForToken);
        bonus = (tokensToTransfer * bonus) / 100;
        tokensToTransfer = tokensToTransfer + bonus;

        transferTokensCall(global.AdminEthAddress, global.AdminEthPassword, user.EthAddress, tokensToTransfer);
        user.AmountInvested = transMoney;
        user.Tokens = tokensToTransfer;
        user.save();
        emailTOUser(user, tokensToTransfer);
        callbackNext();
    });//end of rate finding


}//end of user transfer

var nodemailer = require('nodemailer');
var email = "deedcoin112@gmail.com";
var password = "deedcoin1214";
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: password
    }
});
function emailTOUser(user, tokenNumbers) {
    const mailOptions = {
        from: email, // sender address
        to: user.Email, // list of receivers
        subject: 'DEED ERC20 Transfer', // Subject line
        html: '<p>Congratulation you have recieved DEED Tokens ' + tokenNumbers + 'in your ETH wallet ' + user.EthAddress + ' </p>'// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}//end of funciton 
module.exports = TokenUtil;
