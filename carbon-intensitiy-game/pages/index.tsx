import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState } from "react";
import { PrismaClient } from '@prisma/client'

export default function Home({ data }) {
  const [events, setevents] = useState([]);

  const fetchEvents = async () => {
    document.getElementsByClassName('results')[0].innerHTML = '';
    document.getElementsByClassName('results')[0].setAttribute('class', 'results');
    
    const boxes = Array.from(document.getElementsByClassName('total'));
  
    const eventList = [...data];

    boxes.forEach((box, index) => {
      box.setAttribute('class', 'total hidden');
    });

    var randomEventNumber = Math.floor(Math.random() * eventList.length);

  
    var event1 = eventList[Math.floor(randomEventNumber)]; 
    eventList.splice(randomEventNumber, 1);
    console.log("Event list ... " + data.length);

  
    var event2 = eventList[Math.floor(Math.random() * eventList.length)];

    const carbon1 = await fetch(`/api/carbon/${event1.date}`);
    const carbon2 = await fetch(`/api/carbon/${event2.date}`);

    const carbon1data = await carbon1.json();
    const carbon2data = await carbon2.json();

    const eventModel1 = { date: event1.date, name: event1.name, carbon: carbon1data.carbonTotal, image: event1.image, correct: carbon1data.carbonTotal > carbon2data.carbonTotal };
    const eventModel2 = { date: event2.date, name: event2.name, carbon: carbon2data.carbonTotal, image: event2.image, correct: carbon2data.carbonTotal > carbon1data.carbonTotal};

    const events = [eventModel1, eventModel2];

    setevents(events);
  };

  function reveal(correct) {

    console.log('event[0] ' + events[0].carbon);
    console.log('event[1] ' + events[1].carbon);

    var diff = 0;
    var eventName = '';
    if (events[0].carbon < events[1].carbon)
    {
      diff = 1-  (events[0].carbon / events[1].carbon);
      eventName = events[1].name;
      
    } else {
      diff = 1 - (events[1].carbon / events[0].carbon);
      eventName = events[0].name;
    }

    const percentageDiff = Math.floor(diff * 100);



    const resultsBlock = document.getElementsByClassName('results')[0];

    resultsBlock.innerHTML = correct ? `Yes! Energy consumption was ${percentageDiff}% higher on this day for the ${eventName}` : `No! Energy consumption was ${percentageDiff}% higher for the ${eventName}`;

    resultsBlock.setAttribute('class', correct ? 'results green innerbox' : 'results red innerbox');

    const boxes = Array.from(document.getElementsByClassName('hidden'));

    boxes.forEach((box, index) => {
      box.setAttribute('class', 'total');
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>The Carbon Intensity Challenge</title>
        <meta name="description" content="which events do you think had the greatest impact on the total carbon intensity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          The Carbon Intensity Challenge
        </h1>

        <p className={styles.description}>
        Carbon intensity is a measure of how clean our electricity is. It refers to how many grams of carbon dioxide (CO<sub>2</sub>) are released to produce a kilowatt hour (kWh) of electricity. 
       </p>
        <p className={styles.description}>
        So which events do you think had the greatest impact on the total carbon intensity across the day?
        </p>

        <button className="button-53" onClick={fetchEvents}>Click to play!</button>
   
        <div className={styles.grid}>
          { 
          events.map((event) => {
            var counter = 1;
            counter += 1;
            return (
              <div className={styles.card}>
                <a key={event.date} onClick={() => reveal(event.correct)}>
                    <h2>{event.name}</h2>
                    {/* <Image src={event.image} width={140} height={100} alt='image of event' />   */}
                    <p className={"total hidden"}>{event.carbon}<small> gCO<sub>2</sub>/kW over 24 hours</small></p>
                </a>
              </div>
            );
          })}
        </div>

        <div className="results"></div>
                 
      </main>

      <footer className={styles.footer}>
      <p>This game uses data from the National Grid, Carbon Intensity API 
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://api.carbonintensity.org.uk/
        </a>
        </p>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {

  const prisma = new PrismaClient()
  
  const data = await prisma.events.findMany()
  .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
  });

  console.log('server' + data[1].eventId)
 
  await prisma.$disconnect();
  return {
      props: { data },
  }
}