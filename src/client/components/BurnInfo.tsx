import React, { useState, useEffect } from 'react';
import { ADDRESS, ABI, DEAD } from './info';
import { ethers } from "ethers";


class Ethernets {
    provider: ethers.JsonRpcProvider | undefined;
    contract: ethers.Contract | undefined;
    
    constructor(rpcUrl:string, contractAddres:string, ABI:ethers.InterfaceAbi) {
        let newProvider 
        let newContract
        try {
            newProvider = new ethers.JsonRpcProvider(rpcUrl);
            newContract = new ethers.Contract(contractAddres, ABI, newProvider)
        } catch (error) { console.error(error)}
        this.provider = newProvider
        this.contract = newContract
    }
}

const ETH = new Ethernets("https://eth.llamarpc.com", ADDRESS.eth.hoge, ABI.eth.hoge)
const BSC = new Ethernets("https://bsc-dataseed.binance.org/", ADDRESS.bsc.hoge, ABI.bsc.hoge)
const POLYGON = new Ethernets("https://polygon-rpc.com/", ADDRESS.polygon.hoge, ABI.polygon.hoge)

export function BurnInfo() {
    

    const [deadBalance, setDeadBalance] = useState< ethers.BigNumberish >()
    const [lostBalance, setLostBalance] = useState< ethers.BigNumberish >()

    useEffect(()=>{
        getBal()
    },[])
    

    const getBal = async () => {
        if (ETH.contract) {
            setDeadBalance(await ETH.contract.balanceOf(DEAD))
            setLostBalance(await findLost())
        }
        
    }
    
    const findLost = async () => {
        const lostOnContract = async (contract: ethers.Contract | undefined) => {
            if (contract) {
                return BigInt(await contract.balanceOf(await contract.getAddress()));
            } else {return BigInt(0)}
        }

        const totalLost = await lostOnContract(ETH.contract) +
            await lostOnContract(BSC.contract) +
            await lostOnContract(POLYGON.contract)


        console.log(totalLost)
        return totalLost
    }

    const Info = () => {
        let deadwallet: number = 0
        let lost: number  = 0
        let total: number  = 0
        if (deadBalance && lostBalance) {
            deadwallet = 10**-9 * Number(deadBalance)
            lost = 10**-9 * Number(lostBalance)
            total = (deadwallet + lost)
        }
        const deadStr: string = parseInt(deadwallet.toString().split('.')[0]).toLocaleString()
        const lostStr: string = parseInt(lost.toString().split('.')[0]).toLocaleString()
        const totalStr: string = parseInt(total.toString().split('.')[0]).toLocaleString()

        return <>
            
            <h3>Dead Wallet: {deadStr}</h3>
            <h3>Lost to Contracts: {lostStr}</h3>
            <h3>Total: {totalStr}</h3>
            
        </>
    }

    
    return <Info />
    
}


export default BurnInfo