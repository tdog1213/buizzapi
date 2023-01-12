const cheerio = require("cheerio")
const axios = require("axios")
const express = require("express")
const app = express()
app.listen(1000)

app.get("/company/:id", (req, expResp) => {
    console.log("e")
    let id = req?.params?.id || "undefined"
    if (id === "undefined") {
        return expResp.json({
            "error": true,
            "reason": "Provide a company ID"
        })
    } 
    axios({
        method: "get",
        url: "https://suite.endole.co.uk/insight/company/"+id,
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.76"
        }
    })
    .then(resp => {
        const $ = cheerio.load(resp.data)
        var finalData = {
            keyInfo: {},
            financials: {},
            latestActivity: [],
            people: [],
            mutualCompanies: [],
            contactInfo: []
        }
    
        // Key data
        let companyName = $("#tiles_Key-Data > div:nth-child(5) > div:nth-child(1) > div.-font-size-l").text()
        let desc = $("#tiles_Key-Data > div._item > div").text().trim() || null
        let companyNum = $("#tiles_Key-Data > div:nth-child(6) > div:nth-child(1) > div.-font-size-l").text()
        let status = $("#tiles_Key-Data > div:nth-child(5) > div:nth-child(2) > div.-font-size-l > span").text()
        let founded = `${$("#tiles_Key-Data > div:nth-child(6) > div:nth-child(2) > div.-font-size-l").text()} (${$("#tiles_Key-Data > div:nth-child(6) > div:nth-child(2) > div._list > div > span > b").text()})`
        let size = $("#tiles_Key-Data > div:nth-child(6) > div:nth-child(3) > div.-font-size-l").text() || 0
        let lastAccountSubmitted = $("#tiles_Key-Data > div:nth-child(5) > div:nth-child(4) > div._list > div:nth-child(1) > span > b").text()
        let lastConfirmationSubmitted = $("#tiles_Key-Data > div:nth-child(5) > div:nth-child(3) > div._list > div:nth-child(1) > span > b").text()
        let documents = parseInt($("#tiles_Documents > div.title > span").text()) || 0
    
        let obj = {
            companyName,
            companyNum,
            desc,
            status,
            founded,
            size,
            lastAccountSubmitted,
            lastConfirmationSubmitted,
            documents
        }
    
        finalData.keyInfo = obj
        
    
        // People
        $("#tiles_People > div.striped-table > table > tbody").each((index, element) => {
            $(element).children().toArray().forEach(item => {
                if (Object.keys($(item).css()).length > 0) return;
                $(item).toArray().forEach(item => {
                    let name = $($(item).find("td").children().get(0)).text()
                    let extraInfo = $($(item).find("td").children().get(1)).text()
                    let status = $($(item).find("td").children().get(2)).text()
    
                    let obj = {
                        name,
                        extraInfo,
                        status
                    }
    
                    finalData.people.push(obj)
                    
                   
                })
            })
        })
    
    
        // Mutual companies
        $("#tiles_Mutual-Companies > div.striped-table > table > tbody").each((index, element) => {
            $(element).children().toArray().forEach(item => {
                if (Object.keys($(item).css()).length > 0) return;
                $(item).toArray().forEach(item => {
                    let companyName = $($(item).find("td").children().get(0)).text()
                    let mutualPerson = $($(item).find("td").children().get(1)).text()
                    let status = $($(item).find("td").children().get(2)).text()
    
                    let obj = {
                        companyName,
                        mutualPerson,
                        status
                    }
    
                    finalData.mutualCompanies.push(obj)
                    
                   
                })
            })
        })
    
    
        // Contact info
        let country = $("#tiles_Contact > div:nth-child(3) > table > tbody > tr:nth-child(2) > td:nth-child(2)").text()
        let address = $("#tiles_Contact > div:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(2)").find("br").replaceWith("\n").end().text().split("\n") || "Unreported"
        let telephone = "Unreported"
        let website = $("#tiles_Contact > div:nth-child(3) > table > tbody > tr:nth-child(4) > td:nth-child(2)").text()
        let email = $("#tiles_Contact > div:nth-child(3) > table > tbody > tr:nth-child(4) > td:nth-child(2)").text()
        $("#tiles_Contact > div:nth-child(3) > table > tbody > tr:nth-child(6) > td:nth-child(2)").each((index, element) => {
            var socials = {
    
            }
            if ($(element).text() === "Unreported") {
                // return
            } else {
                $(element).children().toArray().forEach(social => {
                    socials[social.attribs.title.toLocaleLowerCase()] = social.attribs.href
                })
            }
    
            let obj = {
                country,
                address,
                telephone,
                website,
                email,
                socials
            }
    
            finalData.contactInfo = obj
    
        })
    
    
    
    
        // Financials
        let yearEnded = $("#tiles_Financials > div:nth-child(4) > div:nth-child(1) > span.t1").text() || null
        let totalAssets = $("#tiles_Financials > div:nth-child(4) > div:nth-child(2) > span.t1").text() || null
        let totalAssetsDifference = $("#tiles_Financials > div:nth-child(4) > div:nth-child(2) > div > div").text() || null
        let totalLiabilities = $("#tiles_Financials > div:nth-child(4) > div:nth-child(3) > span.t1").text() || null
        let totalLiabilitiesDifference = $("#tiles_Financials > div:nth-child(4) > div:nth-child(3) > div > div").text() || null
        let netAssets = $("#tiles_Financials > div:nth-child(4) > div:nth-child(4) > span.t1").text() || null
        let netAssetsDifference = $("#tiles_Financials > div:nth-child(4) > div:nth-child(4) > div > div").text() || null
        let cashInBank = $("#tiles_Financials > div:nth-child(4) > div:nth-child(5) > span.t1").text() || null
        let turnover = $("#tiles_Financials > div:nth-child(4) > div:nth-child(7) > span.t1").text() || null
        let employeeCount = parseInt($("#tiles_Financials > div:nth-child(4) > div:nth-child(6) > span.t1").text()) || null
        let employeeCountDifference = $("#tiles_Financials > div:nth-child(4) > div:nth-child(6) > div > div").text() || null
        let debtRatio = $("#tiles_Financials > div:nth-child(4) > div:nth-child(8) > span.t1").text() || null
        let debtRatioDifference = $("#tiles_Financials > div:nth-child(4) > div:nth-child(8) > div > div").text() || null
    
        obj = {
            yearEnded,
            totalAssets: {
                totalAssets,
                totalAssetsDifference
            },
            totalLiabilities: {
                totalLiabilities,
                totalLiabilitiesDifference
            },
            netAssets: {
                netAssets,
                netAssetsDifference
            },
            cashInBank,
            turnover,
            employees: {
                employeeCount,
                employeeCountDifference
            },
            debt: {
                debtRatio,
                debtRatioDifference
            }
    
        }
    
        finalData.financials = obj
    
    
        // Latest activity
        $(`div[class="latest-activity"] > table > tbody`).children().each((index, el) => {
    
            let action
            let dateAgo
            let date
            let dateEpoch
            
            if ($(el.lastChild.children).length == 4) {
                action = $(el.lastChild.children[0]).text()
                dateAgo = $(el.lastChild.children[2]).text()
                date = $(el.lastChild.children[3]).text()
                dateEpoch = new Date(date).getTime()/1000
            } else {
                person = $(el.lastChild.children[0]).text()
                action = $(el.lastChild.children[1]).text()
                action = person+action
                dateAgo = $(el.lastChild.children[3]).text()
                date = $(el.lastChild.children[4]).text()
                dateEpoch = new Date(date).getTime()/1000
            }
    
            obj = {
                action,
                dateAgo,
                date,
                dateEpoch
            }
    
            finalData.latestActivity.push(obj)
        })
    
        return expResp.json(finalData)
    
    })
    
})

setTimeout(() => {

}, 1000000)