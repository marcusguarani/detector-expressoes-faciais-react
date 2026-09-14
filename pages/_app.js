import 'nprogress/nprogress.css';
import React from 'react';
import '../fonts/GTWalsheim.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
    return (
        <main className='semHighlight'>
            <Component {...pageProps} />
        </main>
    )
}
