import Link from "next/link";
import Container from "./Container";

const InstagramIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M16 0c-4.349 0-4.891.021-6.593.093c-1.709.084-2.865.349-3.885.745a7.847 7.847 0 0 0-2.833 1.849A7.757 7.757 0 0 0 .84 5.52C.444 6.54.179 7.696.095 9.405c-.077 1.703-.093 2.244-.093 6.593s.021 4.891.093 6.593c.084 1.704.349 2.865.745 3.885a7.847 7.847 0 0 0 1.849 2.833a7.757 7.757 0 0 0 2.833 1.849c1.02.391 2.181.661 3.885.745c1.703.077 2.244.093 6.593.093s4.891-.021 6.593-.093c1.704-.084 2.865-.355 3.885-.745a7.847 7.847 0 0 0 2.833-1.849a7.716 7.716 0 0 0 1.849-2.833c.391-1.02.661-2.181.745-3.885c.077-1.703.093-2.244.093-6.593s-.021-4.891-.093-6.593c-.084-1.704-.355-2.871-.745-3.885a7.847 7.847 0 0 0-1.849-2.833A7.716 7.716 0 0 0 26.478.838c-1.02-.396-2.181-.661-3.885-.745C20.89.016 20.349 0 16 0m0 2.88c4.271 0 4.781.021 6.469.093c1.557.073 2.405.333 2.968.553a4.989 4.989 0 0 1 1.844 1.197a4.931 4.931 0 0 1 1.192 1.839c.22.563.48 1.411.553 2.968c.072 1.688.093 2.199.093 6.469s-.021 4.781-.099 6.469c-.084 1.557-.344 2.405-.563 2.968c-.303.751-.641 1.276-1.199 1.844a5.048 5.048 0 0 1-1.844 1.192c-.556.22-1.416.48-2.979.553c-1.697.072-2.197.093-6.479.093s-4.781-.021-6.48-.099c-1.557-.084-2.416-.344-2.979-.563c-.76-.303-1.281-.641-1.839-1.199c-.563-.563-.921-1.099-1.197-1.844c-.224-.556-.48-1.416-.563-2.979c-.057-1.677-.084-2.197-.084-6.459c0-4.26.027-4.781.084-6.479c.083-1.563.339-2.421.563-2.979c.276-.761.635-1.281 1.197-1.844c.557-.557 1.079-.917 1.839-1.199c.563-.219 1.401-.479 2.964-.557c1.697-.061 2.197-.083 6.473-.083zm0 4.907A8.21 8.21 0 0 0 7.787 16A8.21 8.21 0 0 0 16 24.213A8.21 8.21 0 0 0 24.213 16A8.21 8.21 0 0 0 16 7.787m0 13.546c-2.948 0-5.333-2.385-5.333-5.333s2.385-5.333 5.333-5.333c2.948 0 5.333 2.385 5.333 5.333S18.948 21.333 16 21.333M26.464 7.459a1.923 1.923 0 0 1-1.923 1.921a1.919 1.919 0 1 1 0-3.838c1.057 0 1.923.86 1.923 1.917"
    />
  </svg>
);

const DiscordIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011a.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0a8.258 8.258 0 0 0-.412-.833a.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02a.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059a.051.051 0 0 0-.018-.011a8.875 8.875 0 0 1-1.248-.595a.05.05 0 0 1-.02-.066a.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085a8.254 8.254 0 0 1-1.249.594a.05.05 0 0 0-.03.03a.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019a13.235 13.235 0 0 0 4.001-2.02a.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612c0-.889.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613c0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612c0-.889.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613c0 .888-.631 1.612-1.438 1.612"
    />
  </svg>
);

export default function Footer() {
  return (
    <footer className="text-black py-12">
      <Container className="flex flex-col items-center gap-8 lg:flex-row lg:flex-wrap lg:justify-around text-center">
        {/* Find Your Tribe */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Find Your Tribe</h3>
          <Link
            href="/pre-teens"
            className="no-underline hover:underline text-sm"
          >
            Pre-teens
          </Link>
          <Link href="/teens" className="no-underline hover:underline text-sm">
            Teens
          </Link>
          <Link
            href="/campus"
            className=" no-underline hover:underline text-sm"
          >
            Campus
          </Link>
        </div>

        {/* Practice The Way */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Practice The Way</h3>
          <Link
            href="/community"
            className="no-underline hover:underline text-sm"
          >
            Live in Community
          </Link>
          <Link href="/alpha" className="no-underline hover:underline text-sm">
            Alpha Youth
          </Link>
          <Link href="/pray" className="no-underline hover:underline text-sm">
            Pray
          </Link>
          <a
            href="https://give.collective.my/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:underline text-sm"
          >
            Give
          </a>
        </div>

        {/* Join A Team */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Join A Team</h3>
          <Link
            href="/serve/ss"
            className="no-underline hover:underline text-sm"
          >
            SS
          </Link>
          {/* <Link
            href="/serve/mission"
            className="no-underline hover:underline text-sm"
          >
            Mission
          </Link> */}
          <a
            href="https://collective.my/ministries/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:underline text-sm"
          >
            Church
          </a>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg mb-2">Slide into our DMs</h3>
          <div className="flex items-center justify-center gap-4 mb-2">
            <a
              href="https://www.instagram.com/strictlystudents/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 hover:text-gray-300"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://discord.com/invite/AD5TNYrYNk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 hover:text-gray-300"
            >
              <DiscordIcon />
            </a>
          </div>
          <a
            href="https://www.instagram.com/strictlystudents/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:underline text-sm"
          >
            @strictlystudents
          </a>
          <a
            href="https://www.instagram.com/collectivecentral/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:underline text-sm"
          >
            @collectivecentral
          </a>
        </div>
      </Container>
    </footer>
  );
}
