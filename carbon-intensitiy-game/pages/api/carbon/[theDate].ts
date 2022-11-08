import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import cacheData from 'memory-cache';
import moment from 'moment'

type Carbon = {
    data: Reading[]
}

type Reading = {
    from: Date,
    to: Date,
    intensity: Intensity
}

type Intensity = {
    forecast: number,
    actual: number,
    index: string
}

class DayTotal {
    requestedDate: Date;
    carbonTotal: Number;

    constructor(date:Date, total:Number)
    {
        this.requestedDate = date;
        this.carbonTotal = total;
    }

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<DayTotal>
) {
    const {theDate} = req.query;

    console.log('the date = ' + theDate );

    const url = `https://api.carbonintensity.org.uk/intensity/date/${theDate}`;
    var value = cacheData.get(url);
    if (!value) {
        const hours = 24;
        value = await fetchData(url);
        cacheData.put(url, value, hours * 1000 * 60 * 60);
    }

    res.status(200).send(value)
}

async function fetchData(url){
    const request = await fetch(url)
    var carbonInfo = await request.json() as Carbon 
    
    var apiResult = carbonInfo.data.reduce((sum, current) => 
           sum + (current.intensity.actual ?? current.intensity.forecast), 0);

    return new DayTotal(carbonInfo.data[0].from, apiResult)
}