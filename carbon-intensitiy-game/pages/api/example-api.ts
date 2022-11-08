import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

type Carbon = {
    data: Reading[]
}

type Reading = {
    from: Date,
    to: Date,
    intensity: Intensity[]
}

type Intensity = {
    forecast: string,
    actual: string,
    index: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Carbon>
) {
    const request = await fetch('https://api.carbonintensity.org.uk/intensity/date')
    const { data } = await request.json() as {data:Carbon}
    console.log(data[0])
    res.status(200).send({ ...data })
}