import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get("/users/me").then(r => setMe(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.put("/users/me", { name: me.name, phone: me.phone, address: me.address });
    alert("Saved");
  };

  const upload = async () => {
    const f = new FormData();
    f.append("file", file);
    await api.post("/users/me/photo", f, { headers: { "Content-Type": "multipart/form-data" } });
    const { data } = await api.get("/users/me");
    setMe(data);
  };

  if (!me) return <div>Loading...</div>;

  return (
    <div className="page">
      <h2>My Profile</h2>
      {me.profilePictureUrl && <img src={me.profilePictureUrl} alt="avatar" style={{ width: 120, borderRadius: 8 }} />}
      <form onSubmit={save}>
        <input value={me.name || ""} onChange={e => setMe({ ...me, name: e.target.value })} placeholder="Name" />
        <input value={me.phone || ""} onChange={e => setMe({ ...me, phone: e.target.value })} placeholder="Phone" />
        <input value={me.address || ""} onChange={e => setMe({ ...me, address: e.target.value })} placeholder="Address" />
        <button type="submit">Save</button>
      </form>
      <div style={{ marginTop: 16 }}>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={upload}>Upload Photo</button>
      </div>
    </div>
  );
}
