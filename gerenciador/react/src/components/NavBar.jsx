import { Disclosure } from '@headlessui/react';
import { Menu, LogOut, Home, FilePlus, Wrench, GraduationCap, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import logoDark from './assets/logo_dark.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}


export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    document.body.classList.add('fade-out');
    setTimeout(() => {
      localStorage.removeItem('token');
      navigate('/login');
    }, 300);
  };

  const navigation = [
    { 
      name: 'Home', 
      current: location.pathname === '/', 
      href: '/', 
      icon: Home,
      color: 'hover:text-blue-400'
    },
    { 
      name: 'Registrar novo arquivo', 
      current: location.pathname === '/newPost', 
      href: '/newPost', 
      icon: FilePlus,
      color: 'hover:text-green-400'
    },
    { 
      name: 'Ferramentas e Licenças', 
      current: location.pathname === '/tools', 
      href: '/tools', 
      icon: Wrench,
      color: 'hover:text-yellow-400'
    },
    { 
      name: 'Treinamentos', 
      current: location.pathname === '/training', 
      href: '/training', 
      icon: GraduationCap,
      color: 'hover:text-purple-400'
    }
  ];

  return (
    <Disclosure as="nav" 
      className={classNames(
        'fixed w-full top-0 z-50 transition-all duration-300',
        scrolled ? 'bg-gray-800/95 backdrop-blur-sm shadow-lg' : 'bg-gray-800'
      )}
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200 active:scale-95">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <X className="block h-6 w-6 text-white transform rotate-0 transition-transform duration-200" />
                  ) : (
                    <Menu className="block h-6 w-6 text-white transform rotate-0 transition-transform duration-200" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo and brand */}
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <Link
                  to="/"
                  className="flex-shrink-0 flex items-center text-white group transition-transform duration-200 hover:scale-105"
                >
                  <img 
                    className="block h-8 w-auto rounded-md transform transition-transform group-hover:rotate-3" 
                    src={logoDark} 
                    alt="DMS" 
                  />
                  <h1 className="text-2xl font-bold text-white ml-3 tracking-tight relative">
                    Gerenciador de Arquivos
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </h1>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-1">
                    {navigation.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onMouseEnter={() => setHoveredItem(item.name)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={classNames(
                            'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all duration-200',
                            'hover:bg-gray-700 relative group',
                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:text-white',
                          )}
                        >
                          <IconComponent 
                            className={classNames(
                              'h-5 w-5 transition-all duration-200',
                              hoveredItem === item.name ? 'scale-110' : 'scale-100',
                              item.current ? 'text-white' : 'text-gray-400'
                            )}
                          />
                          <span>{item.name}</span>
                          {/* Animated underline */}
                          <span 
                            className={classNames(
                              'absolute bottom-0 left-0 h-0.5 transition-all duration-300',
                              item.color.replace('hover:', ''),
                              hoveredItem === item.name ? 'w-full' : 'w-0'
                            )}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 group active:scale-95"
                >
                  <LogOut
                    className="h-5 w-5 mr-2 transform transition-transform duration-200 group-hover:translate-x-1" 
                  />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={classNames(
                      'w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                      'transition-all duration-200 transform hover:scale-102',
                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <IconComponent className={classNames(
                      'h-5 w-5 transition-colors duration-200',
                      item.current ? 'text-white' : 'text-gray-400'
                    )} />
                    <span>{item.name}</span>
                  </Disclosure.Button>
                );
              })}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}