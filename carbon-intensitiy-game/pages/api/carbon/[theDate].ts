import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { createSecureContext } from 'tls'

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
    const { theDate } = req.query
   
    console.log('value from route ' + theDate);
    console.log(`https://api.carbonintensity.org.uk/intensity/${theDate}`)
    const request = await fetch(`https://api.carbonintensity.org.uk/intensity/date/${theDate}`)
    var carbonInfo = await request.json() as Carbon 
    
    const total = carbonInfo.data.reduce((sum, current) => 
           sum + current.intensity.actual, 0);
    console.log(total + ' from reduce')

    var a = new DayTotal(carbonInfo.data[0].from, total);
    


    res.status(200).send(a)
}