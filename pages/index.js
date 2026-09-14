import * as faceapi from 'face-api.js';
import NProgress from 'nprogress';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Botao from '../components/outros/botao';
import Styles from '../styles/index.module.css';
import EmojiAleatorio from '../utils/outros/emojiAleatorio';

// Cor de acento (glow, contorno de detecção e indicador) para cada expressão;
const CORES_EXPRESSAO = [
    '#6c63ff', // 0 - Sem expressão definida / neutro - Indigo (marca);
    '#e5484d', // 1 - Nervoso - Vermelho;
    '#3fa772', // 2 - Nojo - Verde;
    '#3e6fd9', // 3 - Medo - Azul;
    '#e0a93b', // 4 - Feliz - Âmbar;
    '#6c63ff', // 5 - Neutro - Indigo (marca);
    '#4a5578', // 6 - Triste - Cinza-azulado;
    '#d14fa0', // 7 - Surpresa - Magenta;
];

export default function Index() {

    const [emoji, setEmoji] = useState('');
    useEffect(() => {
        // Título da página;
        document.title = `Detector de expressões — @marcusguarani`;

        setEmoji(EmojiAleatorio());
    }, []);

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [captureVideo, setCaptureVideo] = useState(false);

    const [msgGeneroIdade, setMsgGeneroIdade] = useState(null);
    const [expressaoAtual, setExpressaoAtual] = useState({});

    const videoRef = useRef();
    const videoHeight = 480;
    const videoWidth = 640;
    const canvasRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';

            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
            ]).then(setModelsLoaded(true));
        }

        loadModels();
    }, []);

    const [isErroSemCamera, setIsErroSemCamera] = useState(false);
    function startVideo() {
        NProgress.start();
        setCaptureVideo(true);

        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then(stream => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
                NProgress.done();
            })
            .catch(err => {
                setIsErroSemCamera(true);
                NProgress.done();
                console.error('Houve um erro:', err);
            });
    }

    function handleVideoOnPlay() {
        setInterval(async () => {
            if (canvasRef && canvasRef.current) {
                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                const displaySize = { width: videoWidth, height: videoHeight }

                faceapi.matchDimensions(canvasRef.current, displaySize);
                const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();

                // Pegar e setar mensagem de gênero e idade, e expressão atual;
                getGeneroIdade(detections);
                getExpressao(detections?.expressions, detections?.gender);

                if (detections) {
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
                    canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

                    const options = { boxColor: corAtualRef.current, label: 'Detectando expressão facial' };
                    const box = resizedDetections.detection.box;
                    const drawBox = new faceapi.draw.DrawBox(box, options);
                    drawBox.draw(canvasRef.current);

                    canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                }
            }
        }, 1000)
    }

    function getGeneroIdade(data) {
        let isHomem = null;
        if (data?.gender === 'female') {
            isHomem = false;
        } else if (data?.gender === 'male') {
            isHomem = true;
        }

        let msg = '';
        if (isHomem !== null) {
            if (data.age <= 4) {
                msg = (isHomem ? 'um bebê' : 'uma bebê');
            } else if (data.age > 4 && data.age < 12) {
                msg = (isHomem ? 'um menininho, criança' : 'uma menininha, criança');
            } else if (data.age > 12 && data.age < 18) {
                msg = (isHomem ? 'um menino' : 'um menina');
            } else if (data.age > 18 && data.age < 28) {
                msg = (isHomem ? 'um jovem adulto' : 'um jovem adulta');
            } else if (data.age > 28 && data.age < 55) {
                msg = (isHomem ? 'um adulto' : 'um adulta');
            } else if (data.age > 55) {
                msg = (isHomem ? 'um senhor de idade' : 'uma senhora de idade');
            }

            msg = `É ${msg}`;
        }

        setMsgGeneroIdade(msg);
    }

    // Ref com a cor atual (evita closure desatualizada dentro do setInterval);
    const corAtualRef = useRef(CORES_EXPRESSAO[0]);

    function getExpressao(data, genero) {
        // Definir genero;
        const isHomem = (genero === 'female' ? false : true);

        // Definir expressão com mais pontos;
        let maxProp = null;
        let maxValue = -1;
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                var value = data[prop]
                if (value > maxValue) {
                    maxProp = prop
                    maxValue = value
                }
            }
        }

        // Ajustar expressão;
        let expressao = 'Sem expressão definida<br/>Você tá aí mesmo? 👻';
        setBackgroundAtual(0);

        if (maxProp === 'angry') {
            expressao = (isHomem ? 'Você está nervoso 😡' : 'Está nervosa 😡');
            setBackgroundAtual(1);
        } else if (maxProp === 'disgusted') {
            expressao = 'Você está com nojo 🤮';
            setBackgroundAtual(2);
        } else if (maxProp === 'fearful') {
            expressao = 'Você está com medo 😨';
            setBackgroundAtual(3);
        } else if (maxProp === 'happy') {
            expressao = 'Você está feliz 😀';
            setBackgroundAtual(4);
        } else if (maxProp === 'neutral') {
            expressao = (isHomem ? 'Você está neutro 😶' : 'Está neutra 😶');
            setBackgroundAtual(5);
        } else if (maxProp === 'sad') {
            expressao = 'Você está triste 😞';
            setBackgroundAtual(6);
        } else if (maxProp === 'surprised') {
            expressao = (isHomem ? 'Você está surpreso 😯' : 'Está surpresa 😯');
            setBackgroundAtual(7);
        }

        // Se o maxValue for menor ou igual a xxx, deve-se colocar uma frase no meio;
        if (maxValue <= 0.8 && !expressao.includes('neutro')) {
            if (expressao.includes('está')) {
                expressao = expressao.replace('está', 'está um pouco');
            }
        }

        // Se o maxValue for maior ou igual a xxx, deve-se colocar uma frase no meio;
        if (maxValue >= 0.999) {
            if (expressao.includes('está') && !expressao.includes('neutro')) {
                expressao = expressao.replace('está', 'está muito');
            }
        }

        setExpressaoAtual({ expre: expressao, pontos: maxValue });
    }

    const [backgroundAtual, setBackgroundAtualState] = useState(0);
    function setBackgroundAtual(indice) {
        corAtualRef.current = CORES_EXPRESSAO[indice];
        setBackgroundAtualState(indice);
    }

    return (
        <Fragment>
            <section className={Styles.container}>
                <div className={Styles.glow} style={{ color: CORES_EXPRESSAO[backgroundAtual] }} />

                <div className={Styles.cabecalho}>
                    <h1>Detector de expressões faciais</h1>
                    <span className={Styles.status}>
                        <span className={`${Styles.statusPonto} ${modelsLoaded ? Styles.ativo : ''}`} />
                        {modelsLoaded ? 'Modelo carregado' : 'Carregando modelo de reconhecimento…'}
                    </span>
                </div>

                <div className={Styles.painel}>
                    {isErroSemCamera === true && (
                        <div className={Styles.divInfos}>
                            <span className={Styles.centralizar}>Parece que houve um erro com sua câmera 😥</span>
                        </div>
                    )}

                    {
                        captureVideo ? (
                            modelsLoaded && (
                                <section className={Styles.sessaoWebcam}>
                                    <div className={Styles.divWebcam}>
                                        <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} />
                                        <canvas ref={canvasRef} />
                                    </div>

                                    {expressaoAtual.expre && (
                                        <div className={Styles.leitura}>
                                            <div className={Styles.leituraItem}>
                                                <span className={Styles.leituraRotulo}>Expressão</span>
                                                <span className={Styles.leituraValor} style={{ color: CORES_EXPRESSAO[backgroundAtual] }}>
                                                    <span className={Styles.leituraPonto} />
                                                    <span dangerouslySetInnerHTML={{ __html: expressaoAtual.expre }}></span>
                                                </span>
                                            </div>

                                            {msgGeneroIdade && (
                                                <div className={Styles.leituraItem}>
                                                    <span className={Styles.leituraRotulo}>Perfil estimado</span>
                                                    <span className={Styles.leituraValor}>{msgGeneroIdade}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            )
                        ) : (
                            <Fragment>
                                <div className={`${Styles.divInfos} ${Styles.divInfosAlt}`}>
                                    <span>Conecte sua webcam e clique no botão abaixo para iniciar {emoji}</span>
                                </div>

                                <div className={Styles.botaoCustom} onClick={() => startVideo()}>
                                    <Botao texto={'Ativar detector de expressões'} url={''} isNovaAba={false} Svg='' />
                                </div>
                            </Fragment>
                        )
                    }
                </div>
            </section>
        </Fragment>
    );
}
