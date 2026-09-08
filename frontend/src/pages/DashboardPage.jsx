import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Camera,
  Gamepad2,
  Handshake,
  House,
  Image,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import homeBg from '../assets/02_home_bg.png';

const featureCards = [
  { title: 'Our Memories', route: '/memories', icon: Camera, tone: 'bg-[#fdf2f4] border-[#f4cfd3]' },
  { title: 'Write in Diary', route: '/diary', icon: BookOpen, tone: 'bg-[#faf3e8] border-[#ead9bf]' },
  { title: 'Compose Letter', route: '/letters', icon: Mail, tone: 'bg-[#f8f0e8] border-[#e7d7c8]' },
  { title: 'Commitments', route: '/commitments', icon: Handshake, tone: 'bg-[#fdf2f4] border-[#f4cfd3]' },
  { title: 'Our Timeline', route: '/timeline', icon: Image, tone: 'bg-[#f4eee7] border-[#e3d6c8]' },
  { title: 'Shared Spaces', route: '/spaces', icon: House, tone: 'bg-[#faf3e8] border-[#ead9bf]' },
  { title: 'Play Games', route: '/games', icon: Gamepad2, tone: 'bg-[#f8eef0] border-[#eccfd5]' }
];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Valli';

  return (
    <main
      className="page-background relative min-h-screen overflow-x-hidden px-4 py-6 pb-10 sm:px-8 sm:py-8 sm:pb-12 lg:px-10 lg:py-10 lg:pb-14"
      style={{
        backgroundImage: `linear-gradient(rgba(250, 241, 226, 0.18), rgba(76, 43, 27, 0.08)), url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundColor: '#f7f2ea'
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#6b442e]/[0.035]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1480px] flex-col gap-8 pb-4">
        <section className="relative flex min-h-[180px] items-start justify-between gap-8 pr-0 lg:min-h-[205px] lg:pr-[290px]">
          <div className="pt-2 sm:pt-4">
            <p className="mb-2 font-handwriting text-sm text-[#a35f68] sm:text-base">A little space for all that matters</p>
            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-[#2c1810] drop-shadow-xs sm:text-5xl lg:text-6xl">
              Good Evening, {firstName}! <span className="font-normal text-[#c86d74]">♡</span>
            </h1>
            <p className="mt-3 font-serif text-base italic text-[#705645] sm:text-lg">
              &quot;A better you is always a work in progress.&quot;
            </p>
          </div>

          <div className="absolute right-0 top-2 hidden h-[185px] w-[250px] lg:block" aria-hidden="true">
            <div className="absolute left-4 top-8 h-[112px] w-[86px] rotate-[-9deg] border border-[#e5d8c5] bg-white p-2 pb-7 shadow-lg">
              <div className="h-full bg-gradient-to-br from-[#d99b79] via-[#c8736d] to-[#754936]" />
              <span className="absolute -top-2 left-1/2 h-5 w-9 -translate-x-1/2 rotate-[-3deg] bg-[#e8b6a7]/80" />
            </div>
            <div className="absolute left-[76px] top-1 h-[112px] w-[86px] rotate-[8deg] border border-[#e5d8c5] bg-white p-2 pb-7 shadow-lg">
              <div className="h-full bg-gradient-to-br from-[#f1cfa2] via-[#c98f6d] to-[#5f493e]" />
              <span className="absolute -top-2 left-1/2 h-5 w-9 -translate-x-1/2 rotate-[4deg] bg-[#f0d6a3]/90" />
            </div>
            <div className="absolute right-0 top-12 w-[145px] rotate-[4deg] border border-[#d9c4a8] bg-[#f3e7d4] px-4 py-5 text-center shadow-[0_10px_22px_rgba(61,36,23,0.16)]">
              <span className="absolute -top-2 left-1/2 h-5 w-10 -translate-x-1/2 rotate-[-3deg] bg-[#e89da2]/60" />
              <p className="font-handwriting text-base font-semibold leading-tight text-[#422614]">
                You are enough<br />just as you are
              </p>
              <span className="mt-2 block text-sm text-[#c86d74]">♡</span>
            </div>
          </div>
        </section>

        <section aria-label="MEMORA features" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
          {featureCards.map(({ title, route, icon: Icon, tone }) => (
            <button
              key={route}
              type="button"
              onClick={() => navigate(route)}
              className="parchment-plaque group flex min-h-[155px] flex-col items-start justify-between rounded-2xl p-4 text-left transition-transform duration-300 hover:-translate-y-1 sm:min-h-[170px] sm:p-5"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-xs ${tone}`}>
                <Icon className="h-5 w-5 text-[#8f4e58]" strokeWidth={1.7} />
              </span>
              <span className="mt-5 flex w-full items-end justify-between gap-2">
                <span className="font-serif text-sm font-bold leading-snug text-[#2c1810] group-hover:text-[#c86d74] sm:text-[15px]">
                  {title}
                </span>
                <ArrowRight className="mb-0.5 h-4 w-4 shrink-0 text-[#c86d74] transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </section>

        <section className="grid flex-1 grid-cols-1 gap-5 pb-2 md:grid-cols-12 md:items-stretch">
          <div className="parchment-plaque relative flex min-h-[205px] flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8 md:col-span-7 lg:col-span-7">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-[#806958]">A little reminder <span className="text-[#c86d74]">♡</span></p>
              <p className="mt-7 max-w-lg font-handwriting text-3xl leading-tight text-[#3d2417] sm:text-4xl">
                &quot;You&apos;re doing better than you think.&quot;
              </p>
            </div>
            <p className="font-serif text-xs italic text-[#a0806b]">Keep going, gently.</p>
            <div className="pointer-events-none absolute bottom-3 right-7 text-6xl leading-none text-[#c8787e]/70">✿</div>
            <div className="pointer-events-none absolute bottom-1 right-12 h-24 w-px rotate-[18deg] bg-[#90715c]/70" />
          </div>

          <div className="flex min-h-[205px] items-center justify-center md:col-span-5 lg:col-span-4 lg:col-start-9">
            <div className="sticky-note relative w-full max-w-md rotate-[2.5deg] px-6 py-8 shadow-paper transition-transform duration-300 hover:rotate-0 sm:px-10 sm:py-10">
              <span className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2" />
              <div className="text-center font-handwriting text-[#3d2417]">
                <p className="text-2xl font-semibold leading-snug sm:text-3xl">
                  Today is a new page.<br />Write something beautiful.
                </p>
                <span className="mt-3 block text-2xl text-[#c86d74]">♡</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
