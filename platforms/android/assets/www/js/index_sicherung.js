/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var constants = {
    'zaehlerId': 'ZAEHLER_ID',
    'zaehlerStandId': 'ZAEHLER_STAND_ID'
};

var app = {
    // Application Constructor
    initialize: function() {
        numeral.language('de');
        //moment.lang('de');
        this.bindEvents();

        db.init();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.addEventListener("offline", db.init(), false);

        //var test1 = moment("2010-10-20T4:30");
        //var test2 = moment("2010-10-20 4:30", "YYYY-MM-DD HH:mm");

        $(document).on('pageinit', '#zaehler_uebersicht', function(event) {
            $('#zaehler_anlegen_speichern').on('click',function(event) {
                db.save_zaehler();
            });
        });

        $(document).on('pageinit', '#zaehlerstand_uebersicht', function(event) {
            $('#zaehlerstand_erfassen_speichern').on('click',function(event) {
                db.save_zaehlerstand();
            });
        });

        $('#zaehler_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehler_uebersicht();
        });

        $('#zaehlerstand_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerstand_uebersicht();
        });

        $('#zaehler_anlegen').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerart();
        });

        $('#zaehlerstand_erfassen').on('pagebeforeshow',function(event, ui) {
            //$('#ablesung').val(new Date().toString('yyyy-MM-ddTHH:mm:ss'));
            //$('#ablesung_am').val(new Date().toString('yyyy-MM-dd'));
            $('#ablesung_am').val(new Date().toString('yyyy-MM-dd'));
            $('#ablesung_um').val(new Date().toString('HH:mm:ss'));
        });
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        db.init();
        console.info('receivedEvent');
    }
};

var db = {
    success: function() {
        console.info("Success processing SQL!");
    },

    error: function(error) {
        console.error("Error processing SQL: " + error.message);
    },

    // Datenbank öffnen
    open: function() {
        return window.openDatabase("VERBRAUCHERZAEHLER", "1.0", "Verbraucherzähler", 1000000);
    },

    // Datenbank anlegen
    init: function() {
        var db = this.open();

        console.log(db.version);

        //db.changeVersion(db.version, "2", function () {console.log("foobar")});

        db.transaction(
            // callback
            function(tx) {

                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_ART');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_KATEGORIE');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_STAND');

                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_ART (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, EINHEIT TEXT, GRAFIK TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_KATEGORIE (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, BESCHREIBUNG TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER (ID INTEGER PRIMARY KEY AUTOINCREMENT, ZAEHLER_ART_ID INTEGER, ZAEHLER_KATEGORIE_ID INTEGER, NAME TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_STAND (ID INTEGER PRIMARY KEY AUTOINCREMENT, ZAEHLER_ID INTEGER, ABLESUNG NUMERIC, STAND NUMERIC, NOTIZ TEXT)');

                // ZAEHLER_ART
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Stromzähler", "kWh", "bolt")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Wasserzähler", "m³", "umbrella")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Gaszähler", "m³", "fire")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Ölzähler", "Liter", "tint")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Photovoltaikzähler", "kWh", "bolt")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Einspeisezähler", "kWh", "bolt")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Zähler", "", "time")');

                // ZAEHLER_KATEGORIE
                tx.executeSql('INSERT INTO ZAEHLER_KATEGORIE (NAME, BESCHREIBUNG) VALUES ("Allgemein", "Standardkategorie")');

                // ZAEHLER
                tx.executeSql('INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (1, 1, "Erstes Obergeschoss")');
                tx.executeSql('INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (3, 1, "Keller")');

                // ZAHLER_STAND
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-01-01T08:30:00"), 1245.46, "")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-02-04T10:00:00"), 1345.46, "Das ist eine Notiz2")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-02-28T23:00:50"), 1545.46, "")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-04-02T13:02:11"), 1645.46, "")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (2, datetime("2013-05-12T13:02:11"), 334587.46, "Das ist nix.")');
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
            }
        );
    },

    retriev_zaehler_uebersicht: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var sql = '\
                    SELECT \
                        Z.ID AS ZAEHLER_ID, \
                        Z.NAME AS ZAEHLER_NAME, \
                        ZA.NAME AS ZAEHLER_ART_NAME, \
                        ZA.EINHEIT AS ZAEHLER_ART_EINHEIT, \
                        ZA.GRAFIK AS ZAEHLER_ART_GRAFIK, \
                        ZK.NAME AS ZAEHLER_KATEGORIE_NAME, \
                        MAX(ZS.STAND) AS ZAEHLER_STAND_STAND, \
                        MAX(ZS.ABLESUNG) AS ZAEHLER_STAND_ABLESUNG \
                    FROM \
                        ZAEHLER Z \
                        INNER JOIN ZAEHLER_ART ZA ON Z.ZAEHLER_ART_ID = ZA.ID \
                        INNER JOIN ZAEHLER_KATEGORIE ZK ON Z.ZAEHLER_KATEGORIE_ID = ZK.ID \
                        LEFT JOIN ZAEHLER_STAND ZS ON Z.ID = ZS.ZAEHLER_ID \
                    GROUP BY ZAEHLER_ID';

                tx.executeSql(sql, [], function (tx, results) {
                    $("#zaehler_uebersicht_listview li").remove();
                    var len = results.rows.length;
                    var listview = $("#zaehler_uebersicht_listview");

                    if (len) {
                        for (var i = 0; i < len; i++){
                            var item = results.rows.item(i);

                            var zaehlerStandStand = item.ZAEHLER_STAND_STAND;
                            if (zaehlerStandStand != null) {
                                zaehlerStandStand = numeral(zaehlerStandStand).format('0,0.00');
                            } else {
                                zaehlerStandStand = '';
                            }

                            var zaehlerStandAblesung = item.ZAEHLER_STAND_ABLESUNG;
                            var zaehlerArtEinheit = item.ZAEHLER_ART_EINHEIT;
                            if (zaehlerStandAblesung != null) {
                                zaehlerStandAblesung = Date.parse(zaehlerStandAblesung).toString('dd.MM.yyyy')
                            } else {
                                zaehlerStandAblesung = '';
                                zaehlerArtEinheit = '';
                            }

                            listview.append('\
                                <li data-icon="' + item.ZAEHLER_ART_GRAFIK + '"><a href="#zaehlerstand_uebersicht" data-transition="slide" data-identity="' + item.ZAEHLER_ID + '" style="padding-right: 15px;">\
                                    <h2 style="color: #33B5E5;"><strong>' + item.ZAEHLER_ART_NAME + '</strong></h2>\
                                    <p>' + item.ZAEHLER_NAME + '</p>\
                                    <p><span style="font-style: italic">' + zaehlerStandStand + ' ' +  zaehlerArtEinheit + '</span></p>\
                                    <p class="ui-li-aside">' + zaehlerStandAblesung + '</p>\
                                </a></li>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $("#zaehler_uebersicht_listview").listview('refresh');
                $('#zaehler_uebersicht_listview a').off();
                $('#zaehler_uebersicht_listview a').on("click", function(event){
                    var zaehlerId = $(this).data("identity");
                    window.localStorage.setItem(constants.zaehlerId, zaehlerId);
                });
            }
        );
    },

    retriev_zaehlerstand_uebersicht: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);
                var sql ='\
                    SELECT \
                        Z.ID AS ZAEHLER_ID,  \
                        ZS.ID AS ZAEHLER_STAND_ID, \
                        ZS.STAND AS ZAEHLER_STAND_STAND, \
                        ZS.ABLESUNG AS ZAEHLER_STAND_ABLESUNG, \
                        ZS.NOTIZ AS ZAEHLER_STAND_NOTIZ, \
                        ZA.NAME AS ZAEHLER_ART_NAME, \
                        ZA.EINHEIT AS ZAEHLER_ART_EINHEIT \
                    FROM \
                        ZAEHLER Z \
                        INNER JOIN ZAEHLER_ART ZA ON Z.ZAEHLER_ART_ID = ZA.ID \
                        LEFT JOIN ZAEHLER_STAND ZS ON Z.ID = ZS.ZAEHLER_ID \
                    WHERE \
                        ZAEHLER_ID = ? \
                    ORDER BY ZAEHLER_STAND_ID DESC';

                tx.executeSql(sql,[zaehlerId], function (tx, results) {
                    $("#zaehlerstand_uebersicht_listview li").remove();
                    var listview = $("#zaehlerstand_uebersicht_listview");
                    var len = results.rows.length;
                    if (len) {
                        for (var i = 0; i < len; i++){
                            var item = results.rows.item(i);
                            var ablesungTimestamp = item.ZAEHLER_STAND_ABLESUNG;
                            var ablesung = Date.parse(ablesungTimestamp).toString('dd.MM.yyyy - HH:mm');

                            if (i == 0) {
                                listview.append('<li data-role="list-divider">' + item.ZAEHLER_ART_NAME + '</li>');
                            }

                            listview.append('\
                                <li><a href="#" data-transition="slide" data-identity="' + item.ZAEHLER_STAND_ID + '" style="padding-right: 15px;">\
                                    <h2><strong>' + ablesung + ' Uhr</strong></h2>\
                                    <p>' + numeral(item.ZAEHLER_STAND_STAND).format('0,0.00') + ' ' + item.ZAEHLER_ART_EINHEIT + '</p>\
                                    <p>' + item.ZAEHLER_STAND_NOTIZ + '</p>\
                                    <p class="ui-li-aside"></p>\
                                </a></li>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
                $("#zaehlerstand_uebersicht_listview").listview('refresh');
            }
        );
    },

    retriev_zaehlerart: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var sql ='\
                    SELECT \
                        ID, \
                        NAME \
                    FROM \
                        ZAEHLER_ART \
                    ORDER BY NAME';

                tx.executeSql(sql,[], function (tx, results) {
                    var len = results.rows.length;
                    if (len) {
                        $("#zaehler_anlegen_content select option").remove();
                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            var selectElement = $("#zaehler_anlegen_content select");
                            if (i == 0) {
                                selectElement.append('<option value="null">Bitte Z&auml;hlerart ausw&auml;hlen</option>');
                            }
                            selectElement.append('<option value="' + item.ID + '">' + item.NAME + '</option>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
                $('#zaehler_anlegen_content select').selectmenu('refresh');
            }
        );
    },

    save_zaehler: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var art = $('#zaehler_anlegen_content #art').val();
                var name = $('#zaehler_anlegen_content #name').val();

                tx.executeSql("INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (?, 1, ?)", [art, name]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $('#zaehler_anlegen_content #art').val('');
                $('#zaehler_anlegen_content #name').val('');
            }
        );
    },

    save_zaehlerstand: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);
                var ablesung_am = $('#zaehlerstand_erfassen_content #ablesung_am').val();
                var ablesung_um = $('#zaehlerstand_erfassen_content #ablesung_um').val();
                var ablesung = ablesung_am + 'T' + ablesung_um;
                var stand = $('#zaehlerstand_erfassen_content #stand').val();
                var notiz = $('#zaehlerstand_erfassen_content #notiz').val();

                tx.executeSql("INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (?, ?, ?, ?)", [zaehlerId, ablesung, stand, notiz]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $('#zaehlerstand_erfassen_content #ablesung').val('');
                $('#zaehlerstand_erfassen_content #stand').val('');
                $('#zaehlerstand_erfassen_content #notiz').val('');
            }
        );
    }
};