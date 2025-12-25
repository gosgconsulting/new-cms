import React from 'react';

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-10">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="space-y-6">{children}</div>
  </section>
);

const FlowbiteExamples: React.FC = () => {
  return (
    <div className="space-y-10">
      <Section id="buttons" title="Buttons">
        <div className="flex flex-wrap gap-3">
          <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">Primary</button>
          <button type="button" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700">Secondary</button>
          <button type="button" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5">Success</button>
          <button type="button" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5">Danger</button>
          <button type="button" className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5">Warning</button>
          <button type="button" className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5">Purple</button>
        </div>
      </Section>

      <Section id="alerts" title="Alerts">
        <div className="space-y-3">
          <div className="p-4 text-sm text-blue-800 rounded-lg bg-blue-50" role="alert">
            <span className="font-medium">Info alert!</span> Change a few things up and try submitting again.
          </div>
          <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
            <span className="font-medium">Success alert!</span> Everything looks good.
          </div>
          <div className="p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50" role="alert">
            <span className="font-medium">Warning alert!</span> Check your inputs.
          </div>
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
            <span className="font-medium">Danger alert!</span> Something went wrong.
          </div>
        </div>
      </Section>

      <Section id="badges" title="Badges">
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Default</span>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Gray</span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Success</span>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Error</span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Warning</span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Purple</span>
        </div>
      </Section>

      <Section id="cards" title="Cards">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Card title</h5>
            <p className="mb-3 font-normal text-gray-700">Here is a sample card content using Flowbite/Tailwind classes.</p>
            <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">
              Read more
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" fill="none" viewBox="0 0 14 10" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/></svg>
            </a>
          </div>
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Another card</h5>
            <p className="mb-3 font-normal text-gray-700">Cards can be combined into grids for layout previews.</p>
            <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900">Details</a>
          </div>
        </div>
      </Section>

      <Section id="dropdowns" title="Dropdowns">
        <div className="relative">
          <button id="dropdownDefaultButton" data-dropdown-toggle="dropdownDefault" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5" type="button">
            Dropdown button
          </button>
          <div id="dropdownDefault" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
            <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
              <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Dashboard</a></li>
              <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Settings</a></li>
              <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Earnings</a></li>
              <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Sign out</a></li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="modal" title="Modal">
        <div className="space-x-2">
          <button data-modal-target="defaultModal" data-modal-toggle="defaultModal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5" type="button">
            Open modal
          </button>
        </div>
        <div id="defaultModal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
          <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">Flowbite modal</h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center" data-modal-hide="defaultModal">
                  <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-base leading-relaxed text-gray-500">This is a basic Flowbite modal using Tailwind classes and data attributes.</p>
              </div>
              <div className="flex items-center p-4 border-t border-gray-200 rounded-b">
                <button data-modal-hide="defaultModal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5">Ok</button>
                <button data-modal-hide="defaultModal" type="button" className="ms-3 text-gray-500 bg-white hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="navbar" title="Navbar">
        <nav className="bg-white border-gray-200 rounded-lg">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="self-center text-2xl font-semibold whitespace-nowrap">Brand</span>
            </a>
            <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-gray-100" aria-controls="navbar-default" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 17 14" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/></svg>
            </button>
            <div className="hidden w-full md:block md:w-auto" id="navbar-default">
              <ul className="font-medium flex flex-col md:flex-row md:space-x-8 rtl:space-x-reverse">
                <li><a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent">Home</a></li>
                <li><a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent">About</a></li>
                <li><a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent">Services</a></li>
                <li><a href="#" className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent">Contact</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </Section>

      <Section id="pagination" title="Pagination">
        <nav aria-label="Page navigation example">
          <ul className="inline-flex items-center -space-x-px">
            <li>
              <a href="#" className="block px-3 py-2 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700">Prev</a>
            </li>
            <li><a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">1</a></li>
            <li><a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">2</a></li>
            <li><a href="#" className="px-3 py-2 leading-tight text-white bg-blue-600 border border-blue-600">3</a></li>
            <li>
              <a href="#" className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700">Next</a>
            </li>
          </ul>
        </nav>
      </Section>

      <Section id="progress" title="Progress">
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </Section>

      <Section id="tabs" title="Tabs">
        <div className="mb-4 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
            <li className="me-2" role="presentation">
              <button className="inline-block p-4 border-b-2 rounded-t-lg" id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Profile</button>
            </li>
            <li className="me-2" role="presentation">
              <button className="inline-block p-4 border-b-2 rounded-t-lg" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Dashboard</button>
            </li>
            <li role="presentation">
              <button className="inline-block p-4 border-b-2 rounded-t-lg" id="settings-tab" data-tabs-target="#settings" type="button" role="tab" aria-controls="settings" aria-selected="false">Settings</button>
            </li>
          </ul>
        </div>
        <div id="default-tab-content">
          <div className="hidden p-4 rounded-lg bg-gray-50" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <p className="text-sm text-gray-500">Profile content</p>
          </div>
          <div className="hidden p-4 rounded-lg bg-gray-50" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
            <p className="text-sm text-gray-500">Dashboard content</p>
          </div>
          <div className="hidden p-4 rounded-lg bg-gray-50" id="settings" role="tabpanel" aria-labelledby="settings-tab">
            <p className="text-sm text-gray-500">Settings content</p>
          </div>
        </div>
      </Section>

      <Section id="tooltips" title="Tooltips">
        <div className="flex items-center gap-6">
          <button data-tooltip-target="tooltip-default" className="px-4 py-2 rounded bg-gray-800 text-white">Hover me</button>
          <div id="tooltip-default" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow opacity-0 tooltip">
            Tooltip content
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </Section>

      <Section id="accordion" title="Accordion">
        <div id="accordion-open" data-accordion="open">
          <h2 id="accordion-open-heading-1">
            <button type="button" className="flex items-center justify-between w-full p-4 font-medium rtl:text-right text-gray-500 border border-b-0 rounded-t-xl hover:bg-gray-100" data-accordion-target="#accordion-open-body-1" aria-expanded="true" aria-controls="accordion-open-body-1">
              <span>What is Flowbite?</span>
              <svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" viewBox="0 0 10 6"><path d="M9 5L5 1 1 5" stroke="currentColor" strokeWidth="2"></path></svg>
            </button>
          </h2>
          <div id="accordion-open-body-1" className="p-4 border border-t-0">
            <p className="text-sm text-gray-500">It’s a library of UI components based on Tailwind CSS.</p>
          </div>
          <h2 id="accordion-open-heading-2">
            <button type="button" className="flex items-center justify-between w-full p-4 font-medium rtl:text-right text-gray-500 border border-b-0 hover:bg-gray-100" data-accordion-target="#accordion-open-body-2" aria-expanded="false" aria-controls="accordion-open-body-2">
              <span>Is it free?</span>
              <svg data-accordion-icon className="w-3 h-3 shrink-0" aria-hidden="true" viewBox="0 0 10 6"><path d="M9 5L5 1 1 5" stroke="currentColor" strokeWidth="2"></path></svg>
            </button>
          </h2>
          <div id="accordion-open-body-2" className="hidden p-4 border border-t-0">
            <p className="text-sm text-gray-500">Yes, Flowbite has free components.</p>
          </div>
        </div>
      </Section>

      <Section id="drawer" title="Drawer">
        <button data-drawer-target="drawer-example" data-drawer-show="drawer-example" aria-controls="drawer-example" className="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5" type="button">Open drawer</button>
        <div id="drawer-example" className="fixed top-0 left-0 z-40 w-80 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white border-r">
          <h5 id="drawer-label" className="text-base font-semibold text-gray-500">Drawer</h5>
          <button type="button" data-drawer-hide="drawer-example" aria-controls="drawer-example" className="text-gray-400 hover:text-gray-900 rounded-lg w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center">
            <span className="sr-only">Close menu</span>
            <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <p className="py-4 text-sm text-gray-500">A left drawer with basic content.</p>
        </div>
      </Section>

      <Section id="forms" title="Forms">
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
            <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="name@company.com" />
          </div>
          <div>
            <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900">Select an option</label>
            <select id="countries" className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
              <option>United States</option>
              <option>Canada</option>
              <option>Germany</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900">Message</label>
            <textarea id="message" rows={3} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <input id="checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="checkbox" className="ms-2 text-sm font-medium text-gray-900">Checkbox</label>
            </div>
            <div className="flex items-center">
              <input id="radio" type="radio" value="" name="radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300" />
              <label htmlFor="radio" className="ms-2 text-sm font-medium text-gray-900">Radio</label>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">Toggle</span>
            </label>
          </div>
        </form>
      </Section>

      <Section id="table" title="Table">
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Color</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">Apple MacBook</th>
                <td className="px-6 py-4">Silver</td>
                <td className="px-6 py-4">Laptop</td>
                <td className="px-6 py-4">$999</td>
              </tr>
              <tr className="bg-white border-b">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">iPhone</th>
                <td className="px-6 py-4">Black</td>
                <td className="px-6 py-4">Phone</td>
                <td className="px-6 py-4">$699</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default FlowbiteExamples;