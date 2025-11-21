const apiUrl = 'http://localhost:3000/api/users';
const usersData = document.getElementById('usersData');

// ---- FELHASZNÁLÓK LEKÉRÉSE ----
async function getUsers() {
    try {
        const response = await fetch(apiUrl);
        const users = await response.json();

        usersData.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.city}</td>
                <td>${user.address}</td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>${user.gender}</td>
                <td>
                    <button onClick="editUser(${user.id}, '${user.firstName}', '${user.lastName}', '${user.city}', '${user.address}', '${user.phone}', '${user.email}', '${user.gender}')">Módosítás</button>
                    <button onClick="deleteUser(${user.id})">Törlés</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e.message);
        alert('Hiba történt az adatok elérése során');
    }
}

// ---- ÚJ FELHASZNÁLÓ HOZZÁADÁSA ----
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (!data.firstName || !data.lastName || !data.city || !data.address || !data.phone || !data.email || !data.gender) {
            alert("Hiányzó adatok! Kérjük, töltsön ki minden mezőt!");
            return;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            getUsers();
        } else {
            alert(result.message);
        }

        e.target.reset();
    } catch (error) {
        alert(error.message);
    }
});

// ---- FELHASZNÁLÓ MÓDOSÍTÁSA ----
async function editUser(id, firstName, lastName, city, address, phone, email, gender) {

    const newFirstName = prompt('Új keresztnév:', firstName);
    const newLastName = prompt('Új vezetéknév:', lastName);
    const newCity = prompt('Új város:', city);
    const newAddress = prompt('Új cím:', address);
    const newPhone = prompt('Új telefonszám:', phone);
    const newEmail = prompt('Új email:', email);
    const newGender = prompt('Új nem:', gender);

    if (!newFirstName || !newLastName || !newCity || !newAddress || !newPhone || !newEmail || !newGender) {
        alert("Minden mezőt ki kell tölteni!");
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: newFirstName,
                lastName: newLastName,
                city: newCity,
                address: newAddress,
                phone: newPhone,
                email: newEmail,
                gender: newGender
            })
        });

        if (response.ok) {
            getUsers();
        } else {
            console.error("HIBA", await response.json());
        }

    } catch (error) {
        console.error("Nem sikerült módosítani:", error);
    }
}

// ---- FELHASZNÁLÓ TÖRLÉSE ----
async function deleteUser(id) {
    if (confirm("Valóban törölni szeretnéd a felhasználót?")) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                getUsers();
            } else {
                console.error("Hiba történt a törlésnél", await response.json());
            }
        } catch (error) {
            alert("A felhasználó törlése sikertelen volt!");
            console.error(error);
        }
    }
}

// Indításkor felhasználók lekérése
// ena conf t
getUsers();