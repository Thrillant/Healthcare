import React from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Certification from '../components/Ceritification';
import HomeDoctors from '../components/HomeDoctors';

const Home = () => {
    return (
        <div>
            <Navbar />
            <Banner />
            <Certification />
            <HomeDoctors />
        </div>
    )
}

export default Home;