import { Card, CardBody, CardHeader, Image, Spacer } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/IMG_20200724_125212.jpg';
import { FaClock, FaCalendarAlt } from 'react-icons/fa'; // Import icons
import { GiFilmProjector } from 'react-icons/gi';
import { MdOutlineRestaurantMenu, MdOutlineLocalLibrary } from 'react-icons/md';
import { BiMoviePlay } from 'react-icons/bi';
import LoginBtn from './auth/LoginBtn';
import SignupBtn from './auth/SignupBtn';

const Homepage = () => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-400 to-primary-600 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('home.kinoCafeTitle')}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {t('home.kinoCafeSubtitle')}
          </p>
          <div className="flex justify-center space-x-4">
            <SignupBtn />
            <LoginBtn />
          </div>
        </div>
        {/* Background image with subtle blur */}
        <div
          className="absolute inset-0 opacity-20  bg-cover bg-center blur-sm"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1558655177-f100941b7e47?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          }}
        />
      </section>

      {/* About Us Section */}
      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-gray-800 dark:text-gray-100 space-y-4">
            <h2 className="text-3xl font-semibold mb-4 flex items-center">
              <MdOutlineRestaurantMenu className="mr-2 text-primary-500" />{' '}
              {/* Icon for About Us */}
              {t('home.aboutUsTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('home.aboutUsText1')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('home.aboutUsText2')}
            </p>
            {/* Placeholder for additional about us images, if needed */}
            {/* <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="aspect-w-16 aspect-h-9">
                  <Image src="/path-to-another-about-us-image.jpg" alt="Another view of Kinó Café" className="object-cover rounded-md shadow-md" />
                </div>
                <div className="aspect-w-16 aspect-h-9">
                  <Image src="/path-to-yet-another-image.jpg" alt="Kinó Café ambiance" className="object-cover rounded-md shadow-md" />
                </div>
              </div> */}
          </div>
          <div className="relative rounded-md shadow-md overflow-hidden">
            <Image
              src={logo}
              alt="Kinó Café Interior"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-8 flex items-center justify-center">
            <GiFilmProjector className="mr-2 text-primary-500" />{' '}
            {/* Icon for Activities */}
            {t('home.activitiesTitle')}
          </h2>

          {/* "Blande" Activities */}
          <Card className="mb-8">
            <CardHeader className="flex items-center">
              <BiMoviePlay className="mr-2 text-xl" />{' '}
              {/* Icon for Blande Activities */}
              <p className="text-lg font-medium">
                {t('home.blandeActivitiesTitle')}
              </p>
            </CardHeader>
            <CardBody className="space-y-2">
              <p>{t('home.blandeActivitiesText1')}</p>
              <ul className="list-disc pl-6">
                <li>{t('home.blandeActivitiesItem1')}</li>
                <li>{t('home.blandeActivitiesItem2')}</li>
                <li>{t('home.blandeActivitiesItem3')}</li>
                <li>{t('home.blandeActivitiesItem4')}</li>
              </ul>

              <p>{t('home.blandeActivitiesText2')}</p>
              {/* Placeholder for image related to "Blande" activities */}
              {/* <div className="mt-4 aspect-w-16 aspect-h-9">
                <Image src="/path-to-blande-activities-image.jpg" alt="Blande Activities" className="object-cover rounded-md shadow-md" />
              </div> */}
            </CardBody>
          </Card>

          {/* "Serie" Activities */}
          <Card className="mb-8">
            <CardHeader className="flex items-center">
              <BiMoviePlay className="mr-2 text-xl" />{' '}
              {/* Icon for Serie Activities */}
              <p className="text-lg font-medium">
                {t('home.serieActivitiesTitle')}
              </p>
            </CardHeader>
            <CardBody className="space-y-2">
              <p>{t('home.serieActivitiesText1')}</p>
              <ul className="list-disc pl-6">
                <li>{t('home.serieActivitiesItem1')}</li>
                <li>{t('home.serieActivitiesItem2')}</li>
                <li>{t('home.serieActivitiesItem3')}</li>
              </ul>
              {/* Placeholder for image related to "Serie" activities */}
              {/* <div className="mt-4 aspect-w-16 aspect-h-9">
                <Image src="/path-to-serie-activities-image.jpg" alt="Serie Activities" className="object-cover rounded-md shadow-md" />
              </div> */}
            </CardBody>
          </Card>

          {/* Library section */}
          <Card className="mb-8">
            <CardHeader className="flex items-center">
              <MdOutlineLocalLibrary className="mr-2 text-xl" />{' '}
              {/* Icon for Library */}
              <p className="text-lg font-medium">{t('home.libraryTitle')}</p>
            </CardHeader>
            <CardBody>
              <p>{t('home.libraryText1')}</p>
              {/* Placeholder for image related to library */}
              {/* <div className="mt-4 aspect-w-16 aspect-h-9">
                <Image src="/path-to-library-image.jpg" alt="Library at Kinó Café" className="object-cover rounded-md shadow-md" />
              </div> */}
            </CardBody>
          </Card>

          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center">
              <FaClock className="mr-1" /> {t('home.openDays')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center">
              <FaCalendarAlt className="mr-1" /> {t('home.openingDate')}
            </p>
          </div>
          <Spacer y={4} />
        </div>
      </section>
    </div>
  );
};

export default Homepage;
