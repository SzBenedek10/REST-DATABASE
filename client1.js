
//REST frontend - HTML kliens, az API elérésére és az adatbázis műveletekre

const { use } = require("react");

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
                    <button>Módosítás</button>
                     <button>onClick="deleteUser(${user.id}" Törlés</button>
                </td>
            </tr>
            `).join('');
    }
    catch (e) {
        console.error(e.message);
        alert('Hiba történt az adatok elérése során')

    }
}

//Adatok küldése az API-nak
//Az ürlap adatok gyüjtése 
document.getElementById('userForm').addEventListener('submit',async(e)=>{
    e.preventDefault();//Az alapértelmezett ürlap visaelkedés letiltása
    try{
            const formData = new FormData(e.target);//Az ürlap adatainak az elérése
            const data = Object.fromEntries(formData);//A data objektum tárolja az input mető értékeit 

            //Az input elemek kitöltségének az ellenörzése 
            if (!data.firstName || !data.lastName || !data.city || !data.address || !data.phone || !data.email || !data.gender){
                alert("Hiányzó adatok!, Kérem, hogy minden töltsön ki mindent ")
            }
            else{
                const  response = await  fetch(apiUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body : JSON.stringify(data)
                });
                //Várunk a server(API)válaszára
                const result = await response.json();

                //Az API válaszától függően.. 

                if (response.ok) {
                    alert(result.message);
                    getUsers(); // A táblázat frissítése 

                }
                else{
                    alert(result.message);
                }
                e.target.reset();
            }
    }
    catch(error){
        alert(error.message)
    }
})
//A felhasználói adatok törlése 
async function deleteUser(id){
    if(confirm("Valóban törölni akarod a felhasználót? ")) {
        try {
            const response = await fetch(`${apiUrl}/${id}`,{
                method: 'DELETE'

            });
               //Nézzük meg hoyg mit válaszolt az Api
               if(response.ok) {
                getUsers();//A tábnlázatunk frissítése

               }
               else {
                console.error("Hiba történt a felhasználó törlése során", await response.json)
               } 
            
            

        }
        catch(error) {
            alert("A felhasználók törlése sikertelen volt");
            console.error( "Az adatok törlése sikertelen volt!", error);

        }
    }
}
getUsers();// Az adatok lekérése szolgáló

