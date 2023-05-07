import React, {useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {CustomMobileNet, load} from '@teachablemachine/image';
import './App.css';

const URL = 'https://teachablemachine.withgoogle.com/models/xdFR5cc7P/'
const modelURL = URL + 'model.json';
const metadataURL = URL + 'metadata.json';

type BabbelName = "bibbi" | "bobbo"

function selectBabelPrediction(predictions: { className: string, probability: number }[]): BabbelName | null {
    const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability);
    const mostProbable = sortedPredictions[0];

    // Process predictions and set state here
    if (mostProbable.probability < 0.7) {
        console.log('not sure')
        return null;
    }

    const newBabel = mostProbable.className;
    if (newBabel !== "bibbi" && newBabel !== "bobbo") {
        return null;
    }

    return newBabel;
}

function BabbelImage({name}: { name: BabbelName }) {
    return <img
        src={`/${name}.webp`}
        alt={name}
        className="w-96"
    />;
}

const App: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [model, setModel] = useState<CustomMobileNet | null>(null);
    const [babbel, setBabbel] = useState<BabbelName | null>(null)

    const getBabbelPrediction = async () => {
        if (model && webcamRef.current) {
            const video = webcamRef.current.video;
            if (video) {
                const predictions = await model.predict(video);
                return selectBabelPrediction(predictions)
            }
        }
        return null;
    };

    console.log(babbel)
    const loadModel = async () => {
        try {
            // Load the model and save it in state
            const model = await load(modelURL, metadataURL)
            setModel(model);

            // Start interval to predict every second
            console.log('START INTERVAL')
        } catch (err) {
            console.log('error loading model', err);
            return null;
        }
        console.log('model loaded')
    };

    useEffect(() => {
        loadModel();
    }, [])

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const babbel = await getBabbelPrediction();
            console.log('setting babel', babbel)
            setBabbel(() => babbel)
        }, 1000);

        return () => clearInterval(intervalId)
    }, []);


    return (
        // centered div)
        <div className="flex min-h-screen flex-col items-center">
            <header className="">
                <Webcam
                    ref={webcamRef}
                    videoConstraints={{
                        facingMode: 'user',
                    }}
                />
            </header>
            <div>{babbel && <BabbelImage name={babbel}/>}</div>
        </div>
    );
};

export default App;
