import backgroundImage from '../assets/Background.svg';
import welcomeCard from '../assets/welcome_card.svg';

export const Landing = () => {
    return (
        <div style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{
                backgroundImage: `url(${welcomeCard})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '40vh',
                width: '40vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                
            </div>
        </div>
    )
}