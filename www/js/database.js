function Database() {

    var that = this;
    
    var dbName = "VERBRAUCHERZAEHLER";
    var dbVersion = "1.0";
    var dbDescription = "Verbraucherzaehler";
    var dbSize = 2 * 1024 * 1024; // 2MB
    
    this.db = window.openDatabase(dbName, dbVersion, dbDescription, dbSize);
    
    function onTxError(error) {
        console.error('Transaction error: ' + error.code + ' - ' + error.message);
    }
    
    function onTxSuccess() {
        console.info('Transaction completed');
    }
        
    function onExecSqlError(error) {
        console.error('Execute sql error: ' + error.code + ' - ' + error.message);
    }
    
    function onExecSqlSuccess() {
        console.info('Execute sql completed');
    }
    
    // Datenbank-Version überprüfung
    this.retrieveVersion = function(onRetrieveVersionSucess, onRetrieveVersionError) {
        that.db.transaction(
            function(tx) {
                tx.executeSql("SELECT MAX(VERSION) AS VERSION FROM DATABASECHANGELOG", [],
                    // success callback
                    function (tx, results) {
                        if(results.rows.length === 1) {
                            var version = results.rows.item(0).VERSION;
                            onRetrieveVersionSucess.call(this, version);
                        } else {
                            onRetrieveVersionError.call(this);
                        }
                    },
                    // error callback
                    function() {
                        onRetrieveVersionError.call(this);
                    }
                );
            },
            onTxError,
            onTxSuccess
        );
    };
    
    // Datenbank initialisieren
    this.initialization = function(onInitializationSucess) {
        that.db.transaction(          
            function(tx) {
            	tx.executeSql('DROP TABLE IF EXISTS DATABASECHANGELOG');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_ART');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_KATEGORIE');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_STAND');
                tx.executeSql('CREATE TABLE IF NOT EXISTS DATABASECHANGELOG (ID INTEGER PRIMARY KEY AUTOINCREMENT, VERSION NUMERIC, ERSTELLT_AM NUMERIC, BESCHREIBUNG TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_ART (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, EINHEIT TEXT, GRAFIK TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_KATEGORIE (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, BESCHREIBUNG TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER (ID INTEGER PRIMARY KEY AUTOINCREMENT, ZAEHLER_ART_ID INTEGER, ZAEHLER_KATEGORIE_ID INTEGER, NAME TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_STAND (ID INTEGER PRIMARY KEY AUTOINCREMENT, ZAEHLER_ID INTEGER, ABLESUNG NUMERIC, STAND NUMERIC, NOTIZ TEXT)');
                
                var version = 1.0;                
                var currentDate = new Date();                
                var currentDateString = currentDate.toString('yyyy-MM-dd') + 'T' + currentDate.toString('HH:mm:ss');
                var beschreibung = 'Erstellung der initialen Datenstruktur.';
                tx.executeSql('INSERT INTO DATABASECHANGELOG (VERSION, ERSTELLT_AM, BESCHREIBUNG) VALUES (?, ?, ?)', [version, currentDateString, beschreibung], onExecSqlSuccess, onExecSqlError);
            },
            onTxError,
            function() {
                onInitializationSucess.call(this);
            }
        );
    };
    
    // Daten importieren    
    this.importData = function(data) {
        that.db.transaction(          
            function(tx) {
                // zaehlerArt
                $(data.zaehlerArt).each(function() {
                    tx.executeSql('INSERT INTO ZAEHLER_ART (ID, NAME, EINHEIT, GRAFIK) VALUES (?, ?, ?, ?)', [this.id, this.name, this.einheit, this.grafik], onExecSqlSuccess, onExecSqlError);
                });
                // zaehlerKategorie
                $(data.zaehlerKategorie).each(function() {
                    tx.executeSql('INSERT INTO ZAEHLER_KATEGORIE (ID, NAME, BESCHREIBUNG) VALUES (?, ?, ?)', [this.id, this.name, this.beschreibung], onExecSqlSuccess, onExecSqlError);
                });
                // zaehlerKategorie
                $(data.zaehler).each(function() {
                    tx.executeSql('INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (?, ?, ?)', [this.zaehlerArtId, this.zaehlerKategorieId, this.name], onExecSqlSuccess, onExecSqlError);
                });
                // zaehlerStand
                $(data.zaehlerStand).each(function() {
                    tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (?, ?, ?, ?)', [this.zaehlerId, this.ablesung, this.stand, this.notiz]);
                });
            },
            onTxError,
            onTxSuccess
        );
    };
}