// FontAwesome Configuration
import { library } from '@fortawesome/fontawesome-svg-core';
import { config } from '@fortawesome/fontawesome-svg-core';

// Import only essential icons that we know exist
import {
  faChartLine,
  faChartBar,
  faChartPie,
  faUsers,
  faUser,
  faUserGraduate,
  faGraduationCap,
  faBookOpen,
  faDollarSign,
  faExclamationTriangle,
  faBuilding,
  faBox,
  faCalendar,
  faBars,
  faTimes,
  faArrowRight,
  faPlay,
  faPause,
  faCheckCircle,
  faAward,
  faRocket,
  faCode,
  faMagic,
  faDatabase,
  faShield,
} from '@fortawesome/free-solid-svg-icons';

// Prevent FontAwesome from adding its CSS
config.autoAddCss = false;

// Add icons to the library
library.add(
  faChartLine,
  faChartBar,
  faChartPie,
  faUsers,
  faUser,
  faUserGraduate,
  faGraduationCap,
  faBookOpen,
  faDollarSign,
  faExclamationTriangle,
  faBuilding,
  faBox,
  faCalendar,
  faBars,
  faTimes,
  faArrowRight,
  faPlay,
  faPause,
  faCheckCircle,
  faAward,
  faRocket,
  faCode,
  faMagic,
  faDatabase,
  faShield,
);

export { library };