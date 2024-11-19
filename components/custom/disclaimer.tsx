import React from 'react';
import { DisclaimerComponent } from '@rainbow-me/rainbowkit';

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
    <Text>
        By connecting your wallet, you agree to the{' '}
        <Link href="https://www.chainable.co/terms-of-service">Terms of Service</Link> and
        acknowledge you have read and understand the protocol{' '}
        <Link href="https://www.chainable.co/privacy-policy">Privacy Policy</Link>. Visit our{' '}
        <Link href="https://www.chainable.co">website</Link> for more information.
    </Text>
);

export default Disclaimer;