import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '@/src/styles/kci/FinalFire.css';

const FinalFire = ({ alienNumber, numberNotes, numberActive, shoot, fireInfo }) => {
    const [blastCoordinates, setBlastCoordinates] = useState({ x: 0, y: -5});
    const [blastScale, setBlastScale] = useState(1);
    const [blastSpeed, setBlastSpeed] = useState(1);
    const [blastColor, setBlastColor] = useState('red');
    const [visible, setVisible] = useState(false);

    let timer;

    // console.log("finalFire, numberActive: ", numberActive);

    useEffect(() => {
        switch (shoot) {
            case 'kill':
                setVisible(true);
                setBlastColor('red');
                setBlastCoordinates({ x: 0, y: -130 });
                setBlastScale(0.25)
                setBlastSpeed(0.4);
                timer = 400; // shoot trajectory time
                setTimeout(() => {
                    setBlastSpeed(0.2);
                    setBlastScale(50);
                    setBlastColor('white');
                }, timer);
                timer += 200; // explosion time
                setTimeout(() => {
                    setBlastScale(1);
                    setVisible(false);
                }, timer);
                break;
            case 'miss':
                setVisible(true);
                setBlastColor('red');
                setBlastCoordinates({ x: fireInfo.error * 100, y: -150 });
                setBlastScale(0.01)
                setBlastSpeed(0.5);
                timer = 600; // shoot trajectory time
                setTimeout(() => {
                    setBlastScale(1);
                    setVisible(false);
                }, timer);
                break;
        }
    }, [shoot]);

    const multiLasers = Array.from({ length: numberNotes }, (_, index) => ({
        id: index,
        xLoad: (index * 100) - ((numberNotes - 1) * 50) // 
    }));

    return (
        <div>
            {multiLasers.map((laser, index) => (
                <motion.div
                    className={`laser ${index < numberActive ? 'red' : 'green'}`}
                    key={`${alienNumber}-${laser.id}-${shoot}-${numberActive}`}
                    initial={{
                        y: -1,
                        x: laser.xLoad
                    }}
                    animate={
                        (shoot === 'kill' || shoot === 'miss') && {
                            y: blastCoordinates.y,
                            x: blastCoordinates.x,
                            scale: blastScale,
                            /* backgroundColor: blastColor */
                        } 
                    }
                    transition={{ duration: blastSpeed, ease: 'easeOut' }}
                 />
            ))}
        </div>
    );

};

export default FinalFire;
