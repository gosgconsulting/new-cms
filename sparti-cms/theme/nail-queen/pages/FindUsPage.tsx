import { Layout } from "../components/Layout";

export default function FindUsPage({ basePath }: { basePath: string }) {
  return (
    <Layout basePath={basePath}>
      <section className="relative h-screen">
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4731.482296020952!2d103.83075757496566!3d1.30730439868029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1992a6c0228d%3A0x9c97bfbd3e2323d4!2sNail%20Queen%20By%20Michelle%20Tran!5e1!3m2!1sen!2sth!4v1757583867807!5m2!1sen!2sth"
            width="100%"
            height="100%"
            style={{ border: 0, pointerEvents: "auto" }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Nail Queen Location"
            className="w-full h-full"
          ></iframe>
        </div>

        <div className="absolute z-30 top-1/2 right-8 transform -translate-y-1/2 pointer-events-auto">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-nail-queen-brown mb-4">Find Us</h1>

              <div>
                <h3 className="text-2xl font-bold text-nail-queen-brown mb-2">Address</h3>
                <p className="text-gray-600">Unit #05-18/19/20 Far East Plaza, Singapore</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-nail-queen-brown mb-2">Phone</h3>
                <p className="text-gray-600">+65 9791 6789</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-nail-queen-brown mb-2">Email</h3>
                <p className="text-gray-600">nailqueen36@gmail.com</p>
              </div>

              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 w-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Open chat</span>
              </button>

              <div className="flex justify-center space-x-3 pt-4">
                <a
                  href="https://www.instagram.com/nailqueen_bymichelletran/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/nailqueenfep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 hover:scale-110 transition-all"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@nailqueenfareast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 hover:scale-110 transition-all"
                  aria-label="Follow our Commercial TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.4-1.958-1.4-3.338h-3.066v13.641c0 2.67-2.168 4.838-4.838 4.838s-4.838-2.168-4.838-4.838c0-2.67 2.168-4.838 4.838-4.838.344 0 .677.038 1 .109V6.851c-.323-.03-.653-.046-.986-.046C4.043 6.805 0 10.848 0 15.857s4.043 9.052 9.052 9.052 9.052-4.043 9.052-9.052V9.565c1.373.946 3.023 1.5 4.793 1.5V7.998c-1.322 0-2.527-.474-3.525-1.264-.249-.197-.483-.415-.7-.651-.391-.426-.734-.89-1.017-1.386-.283-.496-.508-1.02-.677-1.568-.085-.274-.155-.554-.21-.84-.055-.286-.095-.576-.119-.87-.024-.294-.032-.592-.025-.89.007-.298.031-.6.071-.902h-3.066c-.04.302-.064.608-.071.917z" />
                  </svg>
                </a>
                <div
                  className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white opacity-50 cursor-not-allowed"
                  title="YouTube - Coming Soon"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
