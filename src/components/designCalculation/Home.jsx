import DraftSideBar from "../shared/DraftSideBar";
import UserAvatar from "../shared/UserAvatar";
function Home({ onOpenSettings }) {
  return (
    <div style={{ display: "flex" }}>
      <DraftSideBar />
      <div className="absolute top-4 right-4">
        {" "}
        {/* Adjust positioning as needed */}
        <UserAvatar onOpenSettings={onOpenSettings} />
      </div>
      <div style={{ padding: "100px", marginLeft: "250px", flex: 1 }}>
        <h2>Home Page</h2>
      </div>
    </div>
  );
}

export default Home;
