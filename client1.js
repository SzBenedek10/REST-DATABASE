
//REST frontend - HTML kliens, az API elérésére és az adatbázis műveletekre

const apiUrl = 'http://localhost:3000/api/users';
const usersData = document.getElementById('usersData');

//Az API elérése és az adatok lekérése

async function getUsers() {
    try  {
        const response = await fetch(apiUrl); //Kapcsolódás az API-hoz
        const users = await response.json();
        usersData.innerHTML = users.map(user  => `
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
                    <button>Törlés</button>
                </td>
            </tr>
            `).join('');
    }
    catch (e) {
        console.error(e.message);
        alert('Hiba történt az adatok elérése során')

    }
}
getUsers();// Az adatok lekérése szolgáló

