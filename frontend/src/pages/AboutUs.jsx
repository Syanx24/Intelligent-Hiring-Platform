import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { FaLinkedin, FaInstagram, FaFacebookSquare } from "react-icons/fa";
import teamMembers from "../Data/teamMembers.json";

export default function AboutUsPage() {
  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f7f8f4] text-[#20221e]">
      <Header
        onExplore={() => {
          window.location.href = "/#open-roles";
        }}
        onNotice={() => {}}
      />
      <main className="section-wrap mx-auto min-h-[65vh] w-[90%] max-w-[1160px] py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white text-center shadow-lg transition-transform duration-300 hover:-translate-y-2"
            >
              {/* Profile Image */}
              <div className="bg-gray-100 p-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="mx-auto h-36 w-36 rounded-full border-4 border-white object-cover shadow-md"
                />
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {member.name}
                </h2>

                <p className="mt-2 text-sm font-medium text-gray-500">
                  Role: {member.role}
                </p>

                {/* Social Media Links */}
                <div className="mt-5 flex justify-center gap-5">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name}'s LinkedIn`}
                    className="text-blue-700 transition-colors hover:text-blue-900"
                  >
                    <FaLinkedin size={24} />
                  </a>

                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name}'s Instagram`}
                    className="text-pink-600 transition-colors hover:text-pink-800"
                  >
                    <FaInstagram size={24} />
                  </a>

                  <a
                    href={member.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name}'s Facebook`}
                    className="text-blue-600 transition-colors hover:text-blue-800"
                  >
                    <FaFacebookSquare size={24} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
