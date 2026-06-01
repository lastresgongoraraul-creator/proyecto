import json
import os
import random

# =================================================================
# SECCIÓN MANUAL: EDITA LOS ENLACES DE LAS IMÁGENES AQUÍ ABAJO
# Si una imagen está mal, simplemente cambia el enlace entre comillas.
# =================================================================
ENLACES_IMAGENES = {
    "Grand Theft Auto VI": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9rwo.webp",
    "Death Stranding 2: On The Beach": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9ipx.webp",
    "Monster Hunter Wilds": "https://images.igdb.com/igdb/image/upload/t_cover_big/co904o.webp",
    "Pragmata": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobxnx.webp",
    "Fable": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobc6d.webp",
    "Metroid Prime 4: Beyond": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob9xh.webp",
    "Marvel's Wolverine": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob5mk.webp",
    "The Witcher 3: Wild Hunt": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
    "Elden Ring": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
    "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp",
    "God of War Ragnarök": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg",
    "The Last of Us Parte II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5ziw.webp",
    "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp",
    "Zelda: Tears of the Kingdom": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp",
    "Hades II": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaknx.webp",
    "Black Myth: Wukong": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8h3y.webp",
    "Alan Wake II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6jar.webp",
    "Marvel's Spider-Man 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobg1k.webp",
    "Hollow Knight: Silksong": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobebu.webp",
    "Final Fantasy VII Rebirth": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob9k6.webp",
    "Ghost of Yotei": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9coo.webp",
    "Indiana Jones y el Gran Círculo": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7nbc.webp",
    "Doom: The Dark Ages": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9b3o.webp",
    "Star Wars Outlaws": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9nh7.webp",
    "Dragon Age: The Veilguard": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8gj5.webp",
    "Silent Hill 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2vyg.webp",
    "Metal Gear Solid Δ: Snake Eater": "https://images.igdb.com/igdb/image/upload/t_cover_big/coac1n.webp",
    "Gears of War: E-Day": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8bor.webp",
    "Little Nightmares III": "https://images.igdb.com/igdb/image/upload/t_cover_big/coa171.webp",
    "Kingdom Hearts IV": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4n1q.webp",
    "Dragon's Dogma 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co833w.webp",
    "Helldivers 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/coabbf.webp",
    "Stellar Blade": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9s0t.webp",
    "Rise of the Ronin": "https://images.igdb.com/igdb/image/upload/t_cover_big/co59v0.webp",
    "Senua's Saga: Hellblade II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co81i4.webp",
    "Astro Bot": "https://images.igdb.com/igdb/image/upload/t_cover_big/coba3k.webp",
    "Beyond Good & Evil 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2pjv.webp",
    "Control 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob0fw.webp",
    "The Elder Scrolls VI": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ycv.webp",
    "Red Dead Redemption 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
    "The Last of Us Parte I": "https://images.igdb.com/igdb/image/upload/t_cover_big/coa1gq.webp",
    "Horizon Zero Dawn": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2una.webp",
    "Persona 5 Royal": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobaqh.webp",
    "Bloodborne": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob99l.webp",
    "Sekiro: Shadows Die Twice": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2a23.webp",
    "Ghost of Tsushima": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2crj.webp",
    "Spider-Man: Miles Morales": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobg1j.webp",
    "Ratchet & Clank: Una Dimensión Aparte": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2str.webp",
    "Resident Evil 4 Remake": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6bo0.webp",
    "Super Mario Odyssey": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.webp",
    "Mario Kart 8 Deluxe": "https://images.igdb.com/igdb/image/upload/t_cover_big/co213p.webp",
    "Animal Crossing: New Horizons": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3wls.webp",
    "Metroid Dread": "https://images.igdb.com/igdb/image/upload/t_cover_big/coba9g.webp",
    "Starfield": "https://images.igdb.com/igdb/image/upload/t_cover_big/co39vv.webp",
    "Forza Horizon 5": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3ofx.webp",
    "Halo Infinite": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2dto.webp",
    "Minecraft": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8fu7.webp",
    "Stardew Valley": "https://images.igdb.com/igdb/image/upload/t_cover_big/coa93h.webp",
    "Terraria": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaamg.webp",
    "Celeste": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob9dh.webp",
    "Hollow Knight": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp",
    "Cuphead": "https://images.igdb.com/igdb/image/upload/t_cover_big/co65ip.webp",
    "Undertale": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob1t2.webp",
    "Disco Elysium": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9j3v.webp",
    "It Takes Two": "https://images.igdb.com/igdb/image/upload/t_cover_big/cob22v.webp",
    "Sifu": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4h5s.webp",
    "Stray": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4tt2.webp",
    "Tunic": "https://images.igdb.com/igdb/image/upload/t_cover_big/td1t8kb33gyo8mvhl2pc.webp",
    "Vampire Survivors": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4bzv.webp",
    "Street Fighter 6": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaw08.webp",
    "Tekken 8": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7lbb.webp",
    "Mortal Kombat 1": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9b8f.webp",
    "Diablo IV": "https://images.igdb.com/igdb/image/upload/t_cover_big/co69sm.webp",
    "Final Fantasy XVI": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobd9i.webp",
    "Lies of P": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6lxr.webp",
    "Armored Core VI": "https://images.igdb.com/igdb/image/upload/t_cover_big/coan1v.webp",
    "Hi-Fi RUSH": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6219.webp",
    "Ghostrunner 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co97mh.webp",
    "Remnant 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6lnp.webp",
    "Warhammer 40,000: Space Marine 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vab.webp",
    "Metroid Prime Remastered": "https://images.igdb.com/igdb/image/upload/t_cover_big/cobbn9.webp",
    "Pikmin 4": "https://images.igdb.com/igdb/image/upload/t_cover_big/coba9h.webp",
    "Prince of Persia: The Lost Crown": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6lli.webp",
    "Banishers: Ghosts of New Eden": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6lmo.webp",
    "Pacific Drive": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7t2e.webp",
    "Manor Lords": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8550.webp",
    "Shin Megami Tensei V: Vengeance": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7sv4.webp",
    "Elden Ring: Shadow of the Erdtree": "https://images.igdb.com/igdb/image/upload/t_cover_big/co89ko.webp",
    "Marvel's Blade": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7hku.webp",
    "Mafia: The Old Country": "https://images.igdb.com/igdb/image/upload/t_cover_big/coa9dq.webp",
    "Borderlands 4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co9zuq.webp",
    "Dying Light 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co65yk.webp",
    "Ghost of Tsushima 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2crj.webp",
    "The Witcher: Polaris": "https://images.igdb.com/igdb/image/upload/t_cover_big/co95i0.webp",
    "Persona 4 Golden": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1n1x.webp",
    "Persona 3 Reload": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6z12.webp",
    "Kingdom Hearts II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co30t1.webp",
    "Kingdom Hearts III": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tpy.webp",
    "Kingdom Hearts Re:Chain of Memories": "https://images.igdb.com/igdb/image/upload/t_cover_big/co30sq.webp",
}

# =================================================================
# LÓGICA DEL PROGRAMA (No es necesario editar esto)
# =================================================================

# Datos base de los juegos (sin la imagen, que se toma de la sección manual)
games_data = [
    ("Grand Theft Auto VI", "Acción", "['Acción', 'Aventura']", "['PS5', 'Xbox Series X']", 2026, "La próxima y esperadísima entrega de la saga GTA, ambientada en el estado de Leonida (Vice City y alrededores).", "PEGI 18", True, "Rockstar Games"),
    ("Death Stranding 2: On The Beach", "Acción", "['Acción', 'Aventura']", "['PS5']", 2025, "Sam Porter Bridges regresa en un nuevo viaje para salvar a la humanidad de la extinción en este mundo conectado.", "PEGI 18", False, "Kojima Productions"),
    ("Monster Hunter Wilds", "Acción", "['RPG', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2025, "Vive la emoción de la caza en un mundo masivo y vibrante lleno de monstruos colosales y ecosistemas dinámicos.", "PEGI 16", True, "Capcom"),
    ("Pragmata", "Aventura", "['Aventura', 'Ciencia Ficción']", "['PC', 'PS5', 'Xbox Series X']", 2026, "Una aventura de ciencia ficción ambientada en un futuro cercano en la Luna con una tecnología asombrosa.", "PEGI 12", False, "Capcom"),
    ("Fable", "RPG", "['RPG', 'Fantasía']", "['PC', 'Xbox Series X']", 2026, "Explora una tierra de criaturas fantásticas y lugares maravillosos en este reinicio de la clásica saga de RPG.", "PEGI 16", False, "Playground Games"),
    ("Metroid Prime 4: Beyond", "Acción", "['Acción', 'Disparos']", "['Nintendo Switch']", 2025, "Samus Aran regresa para su misión más peligrosa hasta la fecha en la esperada secuela de la saga Prime.", "PEGI 12", False, "Retro Studios"),
    ("Marvel's Wolverine", "Acción", "['Acción', 'Aventura']", "['PS5']", 2026, "Desata las garras de adamantio en esta visión oscura y madura del mutante más famoso de Marvel.", "PEGI 18", False, "Insomniac Games"),
    ("The Witcher 3: Wild Hunt", "RPG", "['RPG', 'Mundo Abierto']", "['PC', 'PS5', 'Xbox Series X']", 2015, "Geralt de Rivia busca a su hija adoptiva en un mundo devastado por la guerra y acechado por monstruos.", "PEGI 18", False, "CD Projekt RED"),
    ("Elden Ring", "Acción", "['RPG', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2022, "Álzate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden en las Tierras Intermedias.", "PEGI 16", True, "FromSoftware"),
    ("Baldur's Gate 3", "RPG", "['RPG', 'Estrategia']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo, traición y sacrificio.", "PEGI 18", True, "Larian Studios"),
    ("God of War Ragnarök", "Acción", "['Acción', 'Aventura']", "['PS5', 'PS4']", 2022, "Kratos y Atreus deben viajar a cada uno de los nueve reinos en busca de respuestas mientras las fuerzas de Asgard se preparan.", "PEGI 18", False, "Santa Monica Studio"),
    ("The Last of Us Parte II", "Acción", "['Acción', 'Supervivencia']", "['PS4', 'PS5']", 2020, "Cinco años después de su peligroso viaje, Ellie y Joel se han asentado en Jackson, pero la paz se rompe violentamente.", "PEGI 18", False, "Naughty Dog"),
    ("Cyberpunk 2077", "RPG", "['RPG', 'Disparos']", "['PC', 'PS5', 'Xbox Series X']", 2020, "Conviértete en V, un merc mercenary cyberpunk en la megalópolis de Night City, obsesionada con el poder y la modificación corporal.", "PEGI 18", False, "CD Projekt RED"),
    ("Zelda: Tears of the Kingdom", "Aventura", "['Aventura', 'Mundo Abierto']", "['Nintendo Switch']", 2023, "Link debe explorar los cielos y las profundidades de Hyrule para salvar el reino de una nueva amenaza ancestral.", "PEGI 12", False, "Nintendo"),
    ("Hades II", "Acción", "['Roguelike', 'Acción']", "['PC']", 2024, "Lucha más allá del Inframundo usando magia oscura para enfrentarte al Titán del Tiempo en esta secuela hechizante.", "PEGI 16", False, "Supergiant Games"),
    ("Black Myth: Wukong", "Acción", "['Acción', 'RPG']", "['PC', 'PS5']", 2024, "Un RPG de acción basado en la mitología china donde encarnas al Predestinado en un viaje lleno de peligros.", "PEGI 16", False, "Game Science"),
    ("Alan Wake II", "Terror", "['Terror', 'Narrativo']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Una serie de asesinatos rituales amenaza Bright Falls. Saga Anderson y Alan Wake luchan por escapar de una pesadilla.", "PEGI 18", False, "Remedy Entertainment"),
    ("Marvel's Spider-Man 2", "Acción", "['Acción', 'Aventura']", "['PS5']", 2023, "Peter Parker y Miles Morales regresan para enfrentarse a la prueba definitiva: salvar la ciudad de Venom y Kraven.", "PEGI 16", False, "Insomniac Games"),
    ("Hollow Knight: Silksong", "Aventura", "['Metroidvania', 'Acción']", "['PC', 'Nintendo Switch']", 2025, "Explora un reino totalmente nuevo como Hornet, la princesa protectora de Hallownest, en esta esperada secuela.", "PEGI 7", False, "Team Cherry"),
    ("Final Fantasy VII Rebirth", "RPG", "['RPG', 'Acción']", "['PS5']", 2024, "Cloud y sus amigos abandonan Midgar para explorar el vasto mundo exterior en busca de Sefirot.", "PEGI 16", False, "Square Enix"),
    ("Ghost of Yotei", "Acción", "['Acción', 'Mundo Abierto']", "['PS5']", 2025, "Un nuevo guerrero Ghost surge en las tierras que rodean el monte Yotei en el año 1603.", "PEGI 18", False, "Sucker Punch"),
    ("Indiana Jones y el Gran Círculo", "Aventura", "['Aventura', 'Acción']", "['PC', 'Xbox Series X']", 2024, "Descubre uno de los mayores misterios de la historia en una aventura individual ambientada entre En busca del arca perdida y La última cruzada.", "PEGI 16", False, "MachineGames"),
    ("Doom: The Dark Ages", "Disparos", "['Disparos', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2025, "Conviértete en el arma definitiva en esta precuela de inspiración medieval que narra el origen de la furia del Slayer.", "PEGI 18", False, "id Software"),
    ("Star Wars Outlaws", "Acción", "['Mundo Abierto', 'Aventura']", "['PC', 'PS5', 'Xbox Series X']", 2024, "Arriésgalo todo como Kay Vess, una buscavidas que busca la libertad y los medios para empezar una nueva vida.", "PEGI 12", False, "Massive Entertainment"),
    ("Dragon Age: The Veilguard", "RPG", "['RPG', 'Fantasía']", "['PC', 'PS5', 'Xbox Series X']", 2024, "Entra en el mundo de Thedas, una tierra vibrante de desiertos escarpados y selvas profundas.", "PEGI 18", False, "BioWare"),
    ("Silent Hill 2", "Terror", "['Terror', 'Supervivencia']", "['PC', 'PS5']", 2024, "Tras recibir una carta de su mujer fallecida, James regresa al lugar donde compartieron tantos recuerdos.", "PEGI 18", False, "Bloober Team"),
    ("Metal Gear Solid Δ: Snake Eater", "Acción", "['Sigilo', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2025, "Descubre el origen del agente operativo Snake y empieza a desvelar la trama de la legendaria serie Metal Gear.", "PEGI 18", False, "Konami"),
    ("Gears of War: E-Day", "Disparos", "['Disparos', 'Acción']", "['PC', 'Xbox Series X']", 2026, "Vive el horror del Día de la Emergencia a través de los ojos de unos jóvenes Marcus Fenix y Dom Santiago.", "PEGI 18", True, "The Coalition"),
    ("Little Nightmares III", "Aventura", "['Puzles', 'Terror']", "['PC', 'PS5', 'Nintendo Switch']", 2025, "Ayuda a Low y Alone a navegar a través de la Espiral y encontrar una salida de la Nada.", "PEGI 12", True, "Supermassive Games"),
    ("Kingdom Hearts IV", "RPG", "['RPG', 'Acción']", "['PS5', 'Xbox Series X']", 2026, "Sora regresa en una nueva aventura ambientada en el mundo de Quadratum, con un estilo visual más realista.", "PEGI 12", False, "Square Enix"),
    ("Dragon's Dogma 2", "RPG", "['RPG', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2024, "Un RPG de acción para un jugador que te permite elegir tu propia experiencia: desde el aspecto de tu Arisen hasta tu grupo.", "PEGI 18", False, "Capcom"),
    ("Helldivers 2", "Disparos", "['Disparos', 'Cooperativo']", "['PC', 'PS5']", 2024, "Únete a los Helldivers para luchar por la libertad en una galaxia hostil en este vertiginoso shooter en tercera persona.", "PEGI 18", True, "Arrowhead Game Studios"),
    ("Stellar Blade", "Acción", "['Acción', 'RPG']", "['PS5']", 2024, "Recupera la Tierra para la humanidad en este espectacular juego de acción y aventura coreano.", "PEGI 18", False, "Shift Up"),
    ("Rise of the Ronin", "Acción", "['Acción', 'Mundo Abierto']", "['PS5']", 2024, "Forja tu propio destino en el Japón del siglo XIX en este RPG de acción de mundo abierto de Team Ninja.", "PEGI 18", True, "Team Ninja"),
    ("Senua's Saga: Hellblade II", "Aventura", "['Aventura', 'Narrativo']", "['PC', 'Xbox Series X']", 2024, "Senua regresa en un viaje brutal de supervivencia a través de los mitos y el tormento de la Islandia vikinga.", "PEGI 18", False, "Ninja Theory"),
    ("Astro Bot", "Plataformas", "['Plataformas', 'Aventura']", "['PS5']", 2024, "Únete a Astro en una gigantesca aventura espacial para rescatar a sus amigos y reconstruir la nave nodriza PS5.", "PEGI 7", False, "Team Asobi"),
    ("Beyond Good & Evil 2", "Aventura", "['Aventura', 'Mundo Abierto']", "['PC', 'PS5', 'Xbox Series X']", 2027, "Una precuela espiritual del clásico de culto, ambientada en un sistema solar masivo y diverso.", "PEGI 18", True, "Ubisoft"),
    ("Control 2", "Acción", "['Acción', 'Misterio']", "['PC', 'PS5', 'Xbox Series X']", 2026, "La esperada secuela de Control que ampliará el extraño mundo de la Agencia Federal de Control.", "PEGI 16", False, "Remedy Entertainment"),
    ("The Elder Scrolls VI", "RPG", "['RPG', 'Mundo Abierto']", "['PC', 'Xbox Series X']", 2027, "La próxima gran entrega de la legendaria serie de fantasía épica de Bethesda.", "PEGI 18", False, "Bethesda Game Studios"),
    ("Red Dead Redemption 2", "Acción", "['Mundo Abierto', 'Aventura']", "['PC', 'PS4', 'Xbox One']", 2018, "La épica historia del forajido Arthur Morgan y la banda de Van der Linde al final de la era del Salvaje Oeste.", "PEGI 18", True, "Rockstar Games"),
    ("The Last of Us Parte I", "Acción", "['Acción', 'Narrativo']", "['PS5', 'PC']", 2022, "Vive la historia emocional y los personajes inolvidables de Joel y Ellie en este remake completo.", "PEGI 18", False, "Naughty Dog"),
    ("Horizon Zero Dawn", "Acción", "['Acción', 'Aventura']", "['PC', 'PS4']", 2017, "En un mundo dominado por máquinas, la joven Aloy busca respuestas sobre su pasado y el destino de la humanidad.", "PEGI 16", False, "Guerrilla Games"),
    ("Persona 5 Royal", "RPG", "['RPG', 'Social Sim']", "['PS4', 'PC', 'Nintendo Switch']", 2020, "Ponte la máscara de Joker y únete a los Ladrones de Guante Blanco en esta versión definitiva del aclamado RPG.", "PEGI 16", False, "Atlus"),
    ("Bloodborne", "Acción", "['Acción', 'Terror']", "['PS4']", 2015, "Enfréntate a tus miedos mientras buscas respuestas en la antigua ciudad de Yharnam, ahora maldecida con una extraña enfermedad.", "PEGI 18", True, "FromSoftware"),
    ("Sekiro: Shadows Die Twice", "Acción", "['Acción', 'Aventura']", "['PC', 'PS4', 'Xbox One']", 2019, "En Sekiro encarnas al 'lobo manco', un guerrero deshonrado y desfigurado rescatado del borde de la muerte.", "PEGI 18", False, "FromSoftware"),
    ("Ghost of Tsushima", "Acción", "['Acción', 'Mundo Abierto']", "['PS4', 'PS5', 'PC']", 2020, "A finales del siglo XIII, el imperio mongol ha asolado naciones enteras en su campaña por conquistar Oriente.", "PEGI 18", False, "Sucker Punch"),
    ("Spider-Man: Miles Morales", "Acción", "['Acción', 'Aventura']", "['PS5', 'PS4', 'PC']", 2020, "El joven Miles Morales intenta adaptarse a su nuevo hogar mientras sigue los pasos de su mentor, Peter Parker.", "PEGI 16", False, "Insomniac Games"),
    ("Ratchet & Clank: Una Dimensión Aparte", "Plataformas", "['Plataformas', 'Acción']", "['PS5', 'PC']", 2021, "Salta de dimensión en dimensión con Ratchet y Clank para derrotar a un malvado emperador de otra realidad.", "PEGI 7", False, "Insomniac Games"),
    ("Resident Evil 4 Remake", "Terror", "['Acción', 'Terror']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Leon S. Kennedy debe rescatar a la hija del presidente en un remoto pueblo europeo acechado por horrores inimaginables.", "PEGI 18", False, "Capcom"),
    ("Super Mario Odyssey", "Plataformas", "['Plataformas', 'Aventura']", "['Nintendo Switch']", 2017, "Únete a Mario en una aventura masiva en 3D por todo el mundo usando sus nuevas habilidades para rescatar a Peach.", "PEGI 7", True, "Nintendo"),
    ("Mario Kart 8 Deluxe", "Carreras", "['Carreras', 'Party']", "['Nintendo Switch']", 2017, "La versión definitiva de Mario Kart 8 con todos los circuitos y personajes de la versión de Wii U más nuevos añadidos.", "PEGI 3", True, "Nintendo"),
    ("Animal Crossing: New Horizons", "Simulación", "['Simulación', 'Vida']", "['Nintendo Switch']", 2020, "Escápate a una isla desierta y crea tu propio paraíso mientras exploras, creas y personalizas todo a tu gusto.", "PEGI 3", True, "Nintendo"),
    ("Metroid Dread", "Aventura", "['Metroidvania', 'Acción']", "['Nintendo Switch']", 2021, "Samus Aran debe escapar de un planeta peligroso mientras es perseguida por los letales robots E.M.M.I.", "PEGI 12", False, "MercurySteam"),
    ("Starfield", "RPG", "['RPG', 'Ciencia Ficción']", "['PC', 'Xbox Series X']", 2023, "Crea el personaje que quieras y explora con una libertad sin precedentes mientras te embarcas en un viaje épico para desentrañar el mayor misterio de la humanidad.", "PEGI 12", False, "Bethesda Game Studios"),
    ("Forza Horizon 5", "Carreras", "['Carreras', 'Mundo Abierto']", "['PC', 'Xbox Series X']", 2021, "Explora los vibrantes paisajes de México en constante evolución con una acción de conducción ilimitada y divertida.", "PEGI 3", True, "Playground Games"),
    ("Halo Infinite", "Disparos", "['Disparos', 'Acción']", "['PC', 'Xbox Series X']", 2021, "Cuando toda esperanza se ha perdido y el destino de la humanidad pende de un hilo, el Jefe Maestro está listo para enfrentarse al enemigo más despiadado.", "PEGI 16", True, "343 Industries"),
    ("Minecraft", "Simulación", "['Sandbox', 'Supervivencia']", "['PC', 'Consolas', 'Móvil']", 2011, "Explora mundos infinitos y construye cualquier cosa, desde la casa más sencilla hasta el más grandioso de los castillos.", "PEGI 7", True, "Mojang Studios"),
    ("Stardew Valley", "Simulación", "['Simulación', 'Granja']", "['PC', 'Consolas', 'Móvil']", 2016, "Has heredado la vieja parcela agrícola de tu abuelo en Stardew Valley. Lánzate a la aventura con unas herramientas de segunda mano y unas pocas monedas.", "PEGI 7", True, "ConcernedApe"),
    ("Terraria", "Acción", "['Sandbox', 'Aventura']", "['PC', 'Consolas', 'Móvil']", 2011, "¡Cava, lucha, explora, construye! Nada es imposible en este juego de aventuras lleno de acción.", "PEGI 12", True, "Re-Logic"),
    ("Celeste", "Plataformas", "['Plataformas', 'Indie']", "['PC', 'Consolas']", 2018, "Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje a la cima de la montaña Celeste.", "PEGI 7", False, "Maddy Makes Games"),
    ("Hollow Knight", "Aventura", "['Metroidvania', 'Acción']", "['PC', 'Consolas']", 2017, "Forja tu propio camino en Hollow Knight, una aventura de acción épica a través de un vasto reino de insectos y héroes en ruinas.", "PEGI 7", False, "Team Cherry"),
    ("Cuphead", "Acción", "['Acción', 'Plataformas']", "['PC', 'Consolas']", 2017, "Un juego de acción clásico de 'correr y disparar' centrado en batallas contra jefes, inspirado en los dibujos animados de los años 30.", "PEGI 7", True, "Studio MDHR"),
    ("Undertale", "RPG", "['RPG', 'Indie']", "['PC', 'Consolas']", 2015, "Bienvenido a UNDERTALE. En este RPG, controlas a un humano que cae al subsuelo en el mundo de los monstruos.", "PEGI 12", False, "tobyfox"),
    ("Disco Elysium", "RPG", "['RPG', 'Narrativo']", "['PC', 'Consolas']", 2019, "Eres un detective con un sistema de habilidades único a tu disposición y toda una manzana de la ciudad para labrarte un camino.", "PEGI 18", False, "ZA/UM"),
    ("It Takes Two", "Aventura", "['Cooperativo', 'Plataformas']", "['PC', 'Consolas']", 2021, "Embárcate en el viaje más loco de tu vida en It Takes Two, una aventura de plataformas que rompe los géneros y creada exclusivamente para jugar en cooperativo.", "PEGI 12", True, "Hazelight"),
    ("Sifu", "Acción", "['Acción', 'Artes Marciales']", "['PC', 'PS5', 'Xbox Series X']", 2022, "Sifu es la historia de un joven estudiante de Kung Fu que busca venganza contra los asesinos de su familia.", "PEGI 16", False, "Sloclap"),
    ("Stray", "Aventura", "['Aventura', 'Gatos']", "['PC', 'PS5', 'Xbox Series X']", 2022, "Perdido, solo y separado de su familia, un gato callejero debe resolver un antiguo misterio para escapar de una ciudad cibernética olvidada.", "PEGI 12", False, "BlueTwelve Studio"),
    ("Tunic", "Aventura", "['Aventura', 'Isométrico']", "['PC', 'Consolas']", 2022, "Explora una tierra llena de leyendas perdidas, poderes antiguos y monstruos feroces en TUNIC, un juego de acción isométrico sobre un pequeño zorro.", "PEGI 7", False, "TUNIC Team"),
    ("Vampire Survivors", "Acción", "['Roguelite', 'Acción']", "['PC', 'Consolas', 'Móvil']", 2022, "¡Aniquila a miles de criaturas nocturnas y sobrevive hasta el amanecer en este juego de terror gótico casual!", "PEGI 12", False, "poncle"),
    ("Street Fighter 6", "Lucha", "['Lucha', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2023, "La nueva evolución de la serie Street Fighter cuenta con modos de juego innovadores y gráficos mejorados.", "PEGI 12", True, "Capcom"),
    ("Tekken 8", "Lucha", "['Lucha', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2024, "La legendaria franquicia de lucha regresa con una nueva historia, nuevos gráficos y mecánicas de combate agresivas.", "PEGI 16", True, "Bandai Namco"),
    ("Mortal Kombat 1", "Lucha", "['Lucha', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Descubre un universo renacido de Mortal Kombat creado por el Dios del Fuego Liu Kang.", "PEGI 18", True, "NetherRealm Studios"),
    ("Diablo IV", "RPG", "['RPG', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2023, "La batalla eterna entre los Cielos Superiores y los Infiernos Abrasadores continúa mientras el caos amenaza con consumir Santuario.", "PEGI 18", True, "Blizzard Entertainment"),
    ("Final Fantasy XVI", "Acción", "['RPG', 'Acción']", "['PS5', 'PC']", 2023, "Una epopeya de fantasía oscura ambientada en el mundo de Valisthea, donde el destino de la tierra lo deciden los poderosos Eikons.", "PEGI 18", False, "Square Enix"),
    ("Lies of P", "Acción", "['Acción', 'Soulslike']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Inspirado en la historia de Pinocho, Lies of P es un juego de acción tipo Souls ambientado en un mundo oscuro de la Belle Époque.", "PEGI 16", False, "Neowiz"),
    ("Armored Core VI", "Acción", "['Acción', 'Mechas']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Personaliza tu propio mecha y embárcate en misiones vertiginosas y explosivas en el remoto planeta Rubicón 3.", "PEGI 12", True, "FromSoftware"),
    ("Hi-Fi RUSH", "Acción", "['Acción', 'Ritmo']", "['PC', 'Xbox Series X', 'PS5']", 2023, "Siente el ritmo mientras el aspirante a estrella de rock Chai y su equipo se rebelan contra una malvada megacorporación.", "PEGI 12", False, "Tango Gameworks"),
    ("Ghostrunner 2", "Acción", "['Acción', 'Cyberpunk']", "['PC', 'PS5', 'Xbox Series X']", 2023, "La sangre correrá en la esperada secuela del aclamado juego de acción cyberpunk en primera persona.", "PEGI 18", False, "One More Level"),
    ("Remnant 2", "Disparos", "['Disparos', 'RPG']", "['PC', 'PS5', 'Xbox Series X']", 2023, "Enfréntate a criaturas aterradoras y gods de otros mundos mientras exploras lo desconocido solo o con amigos.", "PEGI 16", True, "Gunfire Games"),
    ("Warhammer 40,000: Space Marine 2", "Acción", "['Acción', 'Disparos']", "['PC', 'PS5', 'Xbox Series X']", 2024, "Encarna la habilidad y brutalidad sobrehumanas de un Marine Espacial, los mejores guerreros del Emperador.", "PEGI 18", True, "Saber Interactive"),
    ("Metroid Prime Remastered", "Aventura", "['Aventura', 'Disparos']", "['Nintendo Switch']", 2023, "La cazarrecompensas Samus Aran regresa en esta versión remasterizada de su aclamada aventura en primera persona.", "PEGI 12", False, "Retro Studios"),
    ("Pikmin 4", "Estrategia", "['Estrategia', 'Aventura']", "['Nintendo Switch']", 2023, "Guía a unas pequeñas criaturas llamadas Pikmin en una gran aventura en un planeta extraño.", "PEGI 3", True, "Nintendo"),
    ("Prince of Persia: The Lost Crown", "Acción", "['Metroidvania', 'Aventura']", "['PC', 'Consolas']", 2024, "Sumérgete en un elegante y emocionante juego de plataformas y acción ambientado en una versión mitológica de Persia.", "PEGI 12", False, "Ubisoft"),
    ("Banishers: Ghosts of New Eden", "RPG", "['RPG', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2024, "En New Eden, 1695, las comunidades de colonos sufren una terrible maldición.", "PEGI 18", False, "Don't Nod"),
    ("Pacific Drive", "Supervivencia", "['Supervivencia', 'Conducción']", "['PC', 'PS5']", 2024, "Enfréntate a los peligros sobrenaturales de la Zona de Exclusión Olímpica con tu coche como único aliado.", "PEGI 12", False, "Ironwood Studios"),
    ("Manor Lords", "Estrategia", "['Estrategia', 'Simulación']", "['PC']", 2024, "Un juego de estrategia medieval que combina la construcción de ciudades con batallas tácticas a gran escala.", "PEGI 12", True, "Slavic Magic"),
    ("Shin Megami Tensei V: Vengeance", "RPG", "['RPG', 'Turnos']", "['PC', 'Consolas']", 2024, "Explora un Tokio postapocalíptico en esta versión definitiva de SMT V con una nueva historia y mejoras.", "PEGI 16", False, "Atlus"),
    ("Elden Ring: Shadow of the Erdtree", "RPG", "['RPG', 'Acción']", "['PC', 'PS5', 'Xbox Series X']", 2024, "Explora la Tierra de las Sombras, un lugar oculto por el Árbol Áureo, en esta expansión masiva.", "PEGI 16", True, "FromSoftware"),
    ("Marvel's Blade", "Acción", "['Acción', 'Aventura']", "['PC', 'Xbox Series X']", 2027, "Un juego de acción individual en tercera persona ambientado en el corazón de París, protagonizado por el famoso cazador de vampiros.", "PEGI 18", False, "Arkane Lyon"),
    ("Mafia: The Old Country", "Acción", "['Acción', 'Aventura']", "['PC', 'PS5', 'Xbox Series X']", 2025, "Descubre los orígenes del crimen organizado en una cruda historia de la mafia ambientada en los bajos fondos de la Sicilia de 1900.", "PEGI 18", False, "Hangar 13"),
    ("Borderlands 4", "Disparos", "['Disparos', 'RPG']", "['PC', 'PS5', 'Xbox Series X']", 2025, "La próxima entrega de la saga de looter-shooters por excelencia con más armas y caos que nunca.", "PEGI 18", True, "Gearbox Software"),
    ("Dying Light 2", "Acción", "['Acción', 'Supervivencia']", "['PC', 'PS5', 'Xbox Series X']", 2022, "El virus ganó y la civilización ha vuelto a la Edad Media. La Ciudad, uno de los últimos asentamientos humanos, está al borde del colapso.", "PEGI 18", True, "Techland"),
    ("Ghost of Tsushima 2", "Acción", "['Acción', 'Mundo Abierto']", "['PS5']", 2026, "La esperada continuación de la historia de Jin Sakai mientras protege el Japón feudal de nuevas amenazas.", "PEGI 18", False, "Sucker Punch"),
    ("The Witcher: Polaris", "RPG", "['RPG', 'Mundo Abierto']", "['PC', 'PS5', 'Xbox Series X']", 2027, "El comienzo de una nueva saga en el universo de The Witcher, desarrollada en Unreal Engine 5.", "PEGI 18", False, "CD Projekt RED"),
    ("Persona 4 Golden", "RPG", "['RPG', 'Aventura', 'Novela Visual']", "['PC', 'PS Vita']", 2012, "Persona 4 Golden es una versión mejorada del aclamado RPG Shin Megami Tensei: Persona 4. El juego sigue a un grupo de estudiantes de secundaria que investigan una serie de extraños asesinatos en un pequeño pueblo rural mientras descubren un mundo paralelo dentro de la televisión.", "PEGI 12", False, "Atlus"),
    ("Persona 3 Reload", "RPG", "['RPG', 'Aventura']", "['PC', 'PS5', 'Xbox Series X']", 2024, "Una reimaginación cautivadora del RPG que definió el género, renacido para la era moderna. Ponte en la piel de un estudiante recién trasladado que se ve empujado a un destino inesperado al entrar en la hora 'escondida' entre un día y el siguiente.", "PEGI 12", False, "Atlus"),
    ("Kingdom Hearts II", "RPG", "['RPG', 'Aventura']", "['PS2', 'PS4', 'PC']", 2005, "La secuela directa de Kingdom Hearts. Continúa la historia de Sora, Donald y Goofy mientras buscan a sus amigos desaparecidos y luchan contra los Sincorazón y una nueva y misteriosa amenaza: la Organización XIII.", "PEGI 12", False, "Square Enix"),
    ("Kingdom Hearts III", "RPG", "['RPG', 'Aventura']", "['PS4', 'Xbox One', 'PC']", 2019, "Sora se une al Pato Donald y a Goofy en una aventura a través de mundos de Disney y Pixar para evitar que una segunda Guerra de las Llaves Espada destruya el equilibrio de la luz y la oscuridad, enfrentándose finalmente al maestro Xehanort.", "PEGI 12", False, "Square Enix"),
    ("Kingdom Hearts Re:Chain of Memories", "RPG", "['RPG', 'Aventura']", "['PS2', 'PS4', 'PC']", 2007, "Un remake completo en 3D del título original de Game Boy Advance. Sirve como puente argumental entre el primer juego y la secuela, narrando la entrada de Sora en el Castillo del Olvido, donde cada paso adelante le hace perder sus recuerdos.", "PEGI 12", False, "Square Enix"),
]

# No rrellenamos, usamos exactamente los juegos definidos en games_data
# if len(games_data) < 100:
#     for i in range(100 - len(games_data)):
#         games_data.append(("Juego Extra " + str(i), "Indie", "['Indie']", "['PC']", 2024, "Un juego indie extra para completar la lista.", "PEGI 12", False, "Indie Studio"))

sql_content = "-- V9__Add_100_New_Games.sql\n\n"
# Limpiar la tabla antes de insertar para evitar duplicados y asegurar consistencia
sql_content += "DELETE FROM games;\n\n"
sql_content += "INSERT INTO games (name, primary_genre, genres, platforms, release_year, summary, avg_score, total_reviews, cover_url, embedding, created_at, pegi, is_multiplayer, developer, publisher, official_website)\nVALUES\n"

values_lines = []
for i, game in enumerate(games_data):
    name = game[0]
    
    # Obtener la URL de la sección manual
    url = ENLACES_IMAGENES.get(name, "https://via.placeholder.com/264x352?text=Sin+Imagen")
    
    # Solo poner puntuaciones a juegos ya lanzados (<= 2024)
    if game[4] <= 2024:
        score = round(random.uniform(7.5, 9.7), 1)
        reviews = random.randint(100, 5000)
    else:
        score = 0.0
        reviews = 0
    
    name_clean = name.replace("'", "''")
    summary_clean = game[5].replace("'", "''")
    developer = game[8].replace("'", "''")
    
    # Construir la línea SQL
    val = f"    ('{name_clean}', '{game[1]}', ARRAY{game[2]}, ARRAY{game[3]}, {game[4]}, '{summary_clean}', {score}, {reviews}, '{url}', array_fill(0, ARRAY[384])::vector, CURRENT_TIMESTAMP, '{game[6]}', {game[7]}, '{developer}', '{developer}', 'https://www.igdb.com')"
    values_lines.append(val)

sql_content += ",\n".join(values_lines)
sql_content += ";\n"

# Guardar el archivo SQL
path_sql = "backend/src/main/resources/db/migration/V9__Add_100_New_Games.sql"
os.makedirs(os.path.dirname(path_sql), exist_ok=True)
with open(path_sql, "w", encoding="utf-8") as f:
    f.write(sql_content)

print(f"Generado {path_sql} con {len(values_lines)} juegos.")
print("Ahora puedes editar 'ENLACES_IMAGENES' en este script y volver a ejecutarlo para actualizar el SQL.")
