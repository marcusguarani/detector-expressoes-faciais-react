import React from 'react';
import Styles from '../../styles/sidebar.module.css';

const links = [
    {
        nome: 'GitHub',
        url: 'https://github.com/marcusguarani',
        icone: (
            <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.42-2.68 5.39-5.24 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.38 23.5 17.07 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z' />
            </svg>
        )
    },
    {
        nome: 'LinkedIn',
        url: 'https://www.linkedin.com/in/marcus-guarani-26789425',
        icone: (
            <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02ZM7 8.48H3V21h4V8.48ZM13.32 8.48H9.5V21h3.82v-6.57c0-3.66 4.75-3.96 4.75 0V21H22v-7.93c0-6.17-6.87-5.94-8.68-2.91V8.48Z' />
            </svg>
        )
    },
    {
        nome: 'Face API',
        url: 'https://github.com/justadudewhohacks/face-api.js/',
        icone: (
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'>
                <path strokeLinecap='round' d='M9 3H4v5M15 3h5v5M9 21H4v-5M15 21h5v-5' />
                <circle cx='9' cy='10' r='1' fill='currentColor' stroke='none' />
                <circle cx='15' cy='10' r='1' fill='currentColor' stroke='none' />
                <path strokeLinecap='round' d='M9 15c1 1 5 1 6 0' />
            </svg>
        )
    }
];

export default function Sidebar() {
    return (
        <nav className={Styles.side}>
            <div className={Styles.marca}>MG</div>

            <div className={Styles.nav}>
                {links.map(link => (
                    <a key={link.nome} className={Styles.navLink} href={link.url} target='_blank' rel='noreferrer'>
                        {link.icone}
                        <span className={Styles.tooltip}>{link.nome}</span>
                    </a>
                ))}
            </div>
        </nav>
    )
}
