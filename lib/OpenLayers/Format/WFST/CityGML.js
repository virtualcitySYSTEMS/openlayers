/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/WFST/v1.js
 * @requires OpenLayers/Format/Filter/v2_0_0.js
 * @requires OpenLayers/Format/OWSCommon/v1_0_0.js
 * @requires OpenLayers/Format/GML/v3_2_1.js
 */

/**
 * Class: OpenLayers.Format.WFST.CityGML
 * A format for creating WFS v2.0.0 transactions for the virtualcitysystems 3dCityDB WFS.  Create a new instance with the
 *     <OpenLayers.Format.WFST.CityGML> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.Filter.v2_0_0>
 *  - <OpenLayers.Format.WFST.v1>
 */
OpenLayers.Format.WFST.CityGML = OpenLayers.Class(
		 OpenLayers.Format.Filter.v2_0_0, OpenLayers.Format.WFST.v1, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        wfs: "http://www.opengis.net/wfs/2.0",
        gml: "http://www.opengis.net/gml/3.2",
        gml31: "http://www.opengis.net/gml",        
        fes: "http://www.opengis.net/fes/2.0",
        xmlns: "http://www.w3.org/2000/xmlns/",
        iso19112: "http://www.opengis.net/iso19112", // this is a convenience for reading iso19112 Positions, geographicIdent and parent information
        core:"http://www.opengis.net/citygml/2.0", 
        tran:"http://www.opengis.net/citygml/transportation/2.0", 
        wtr:"http://www.opengis.net/citygml/waterbody/2.0", 
        grp:"http://www.opengis.net/citygml/cityobjectgroup/2.0", 
        luse:"http://www.opengis.net/citygml/landuse/2.0",
        frn:"http://www.opengis.net/citygml/cityfurniture/2.0", 
        app:"http://www.opengis.net/citygml/appearance/2.0", 
        tex:"http://www.opengis.net/citygml/texturedsurface/2.0", 
        bldg:"http://www.opengis.net/citygml/building/2.0", 
        citydb:"http://www.3dcitydb.org/citygml-ade/3.0",
        xal:"urn:oasis:names:tc:ciq:xsdschema:xAL:2.0", 
        dem:"http://www.opengis.net/citygml/relief/2.0", 
        veg:"http://www.opengis.net/citygml/vegetation/2.0", 
        gen:"http://www.opengis.net/citygml/generics/2.0",
        brid:"http://www.opengis.net/citygml/bridge/2.0",
        tun:"http://www.opengis.net/citygml/tunnel/2.0"
        	
        	
    },
    /**
     * Property: version
     * {String} WFS version number.
     */
    version: "2.0.0",
    
    /**
     * Property: schemaLocations
     * {Object} Properties are namespace aliases, values are schema locations.
     */
    schemaLocations: {
        "wfs": "http://schemas.opengis.net/wfs/2.0/wfs.xsd",
        "core":"http://schemas.opengis.net/citygml/2.0/cityGMLBase.xsd",
        "tran":"http://schemas.opengis.net/citygml/transportation/2.0/transportation.xsd",
        "wtr":"http://schemas.opengis.net/citygml/waterbody/2.0/waterBody.xsd",
        "grp":"http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd",
        "luse":"http://schemas.opengis.net/citygml/landuse/2.0/landUse.xsd",
        "frn":"http://schemas.opengis.net/citygml/cityfurniture/2.0/cityFurniture.xsd",
        "app":"http://schemas.opengis.net/citygml/appearance/2.0/appearance.xsd",
        "citydb":"http://www.virtualcitysystems.de/3dcitydb/citygml-ade/3.0/3dcitydb-ade-citygml-2.0.xsd",
        "tex":"http://schemas.opengis.net/citygml/texturedsurface/2.0/texturedSurface.xsd",
        "bldg":"http://schemas.opengis.net/citygml/building/2.0/building.xsd",
        "dem":"http://schemas.opengis.net/citygml/relief/2.0/relief.xsd",
        "veg":"http://schemas.opengis.net/citygml/vegetation/2.0/vegetation.xsd",
        "gen":"http://schemas.opengis.net/citygml/generics/2.0/generics.xsd",
        "brid":"http://schemas.opengis.net/citygml/bridge/2.0/bridge.xsd",
        "tun":"http://schemas.opengis.net/citygml/tunnel/2.0/tunnel.xsd"
        
    },

    /**
     * Constructor: OpenLayers.Format.WFST.CityGML
     * A class for parsing and generating WFS v2.0.0 transactions.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options properties:
     * featureType - {String} Local (without prefix) feature typeNames (required).
     * featureNS - {String} Feature namespace (optional).
     * featurePrefix - {String} Feature namespace alias (optional - only used
     *     if featureNS is provided).  Default is 'feature'.
     * geometryName - {String} Name of geometry attribute.  Default is 'the_geom'.
     */
    initialize: function(options) {
    	options = OpenLayers.Util.applyDefaults(
    	        options, OpenLayers.Format.WFST.DEFAULTS
    	    );
    	OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
        this.setGeometryTypes();        
        this.singleFeatureType = false;        
        OpenLayers.Format.WFST.v1.prototype.initialize.apply(this, [options]);
    },
    
    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     * first - {Boolean} Should be set to true for the first node read. This
     *     is usually the readNode call in the read method. Without this being
     *     set, auto-configured properties will stick on subsequent reads.
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was provided).
     */
    readNode: function(node, obj, first) {
        // Not the superclass, only the mixin classes inherit from
        // Format.GML.v2. We need this because we don't want to get readNode
        // from the superclass's superclass, which is OpenLayers.Format.XML.
        return OpenLayers.Format.GML.v3_2_1.prototype.readNode.apply(this, arguments);
    },
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {    	 
    	 "function":function(node, obj){
      		if(!obj.attributes["function"]){
      			obj.attributes["function"] = [];
     		}        		        		
      		var value = this.getChildValue(node);
      		obj.attributes["function"].push(value);    		
     	 },
     	 "usage":function(node, obj){
     		if(!obj.attributes["usage"]){
     			obj.attributes["usage"] = [];
    		}        		        		
     		var value = this.getChildValue(node);
     		obj.attributes["usage"].push(value);    		
    	 },
    	 "wfs": OpenLayers.Util.applyDefaults({
             "FeatureCollection": function(node, obj) {
                 obj.numberReturned = parseInt(node.getAttribute(
                     "numberReturned"));
                 obj.numberMatched = parseInt(node.getAttribute(
                 "numberMatched"));
                 OpenLayers.Format.WFST.v1.prototype.readers["wfs"]["FeatureCollection"].apply(
                     this, arguments);
             },
             "TransactionResponse": function(node, obj) {
                 obj.insertIds = [];
                 obj.success = false;
                 this.readChildNodes(node, obj);
             },
             "TransactionSummary": function(node, obj) {
                 obj.success = true;
             },
             "InsertResults": function(node, obj) {
                 this.readChildNodes(node, obj);
             },
             "Feature": function(node, container) {
                 var obj = {fids: []};
                 this.readChildNodes(node, obj);
                 container.insertIds.push(obj.fids[0]);
             },
             "member": function(node, obj) {
                 this.readChildNodes(node, obj);
             },
             "boundedBy": function(node, obj) {
                 var container = {};
                 this.readChildNodes(node, container);
                 if(container.components && container.components.length > 0) {
                     obj.bounds = container.components[0];
                 }
             }

         }, OpenLayers.Format.WFST.v1.prototype.readers["wfs"]),
        "gml": OpenLayers.Util.applyDefaults({
        	"description":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"name":function(node, obj){
          		if(!obj.attributes["name"]){
          			obj.attributes["name"] = [];
         		}        		        		
          		var value = this.getChildValue(node);
          		obj.attributes["name"].push(value);
        	}
        }, OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),                
        "feature": OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"],
        "gml31": OpenLayers.Format.GML.v3.prototype.readers["gml"],
        "ows": OpenLayers.Format.OWSCommon.v1_0_0.prototype.readers["ows"],
        "fes": OpenLayers.Format.Filter.v2_0_0.prototype.readers["fes"],
        "iso19112":OpenLayers.Format.GML.Base.prototype.readers["iso19112"],
        "core": OpenLayers.Util.applyDefaults({
    		"externalReference":function(node, container){
        		if(!container.attributes.externalReferences){
        			container.attributes.externalReferences = [];
        		}        		        		
        		var externalReference = {};
        		this.readChildNodes(node, externalReference);
        		container.attributes.externalReferences.push(externalReference);
        	},
    		"externalObject":function(node, externalReference){
    			this.readChildNodes(node, externalReference);
    		},
    		"name":function(node, externalReference){
    			var value = this.getChildValue(node);
    			externalReference.name = value;
    		},
    		"uri":function(node, externalReference){
    			var value = this.getChildValue(node);
    			externalReference.uri = value;
    		},
    		"informationSystem":function(node, externalReference){
    			var value = this.getChildValue(node);
    			externalReference.informationSystem = value;
    		},
    		"creationDate":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"terminationDate":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"relativeToTerrain":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"relativeToWater":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"Address":function(node, obj) {
                this.readChildNodes(node, obj);
            },
    		"xalAddress":function(node, obj) {
                this.readChildNodes(node, obj);
            }
    	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),
    	"xal": OpenLayers.Util.applyDefaults({
    		"AddressDetails":function(node, obj){
    			this.readChildNodes(node, obj);
    		},
    		"Country":function(node, obj){
    			this.readChildNodes(node, obj);
    		},
    		"Locality":function(node, obj){
    			this.readChildNodes(node, obj);
    		},
    		"PostBox":function(node, obj){
    			this.readChildNodes(node, obj);
    		},
    		"Thoroughfare":function(node, obj){
    			this.readChildNodes(node, obj);
    		},
    		"PostalCode":function(node, obj){
    			this.readChildNodes(node, obj);
    		},
    		"CountryName": function(node, obj) {                
                var value = this.getChildValue(node);
                obj.attributes["country"] = value;
            },
    		"LocalityName":function(node, obj) {                
                var value = this.getChildValue(node);
                obj.attributes["city"] = value;
            },
    		"PostBoxNumber":function(node, obj) {                
                var value = this.getChildValue(node);
                obj.attributes["poBox"] = value;
            },
    		"ThoroughfareNumber":function(node, obj) {                
                var value = this.getChildValue(node);
                obj.attributes["houseNumber"] = value;
            },
    		"ThoroughfareName":function(node, obj) {                
                var value = this.getChildValue(node);
                obj.attributes["street"] = value;
            },
    		"PostalCodeNumber":function(node, obj) {                
                var value = this.getChildValue(node);
                obj.attributes["zipCode"] = value;
            }
    	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),    
    	"citydb": OpenLayers.Util.applyDefaults({    		
    		"lastModificationDate":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"updatingPerson":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"reasonForUpdate":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
    		"lineage":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"]
    	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),     
    	"gen": OpenLayers.Util.applyDefaults({
        	"GenericCityObject":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])},
        	"genericAttribute":function(node, container){
        		if(!container.attributes.genericAttributes){
        			container.attributes.genericAttributes = [];
        		}        		        		
        		if(node.getAttribute("name")){
        			var genericAttribute = {}
        			genericAttribute.name = node.getAttribute("name");
        			this.readChildNodes(node, genericAttribute);
        			return genericAttribute;
        		}
        		return null;
        	},
        	"stringAttribute":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "string";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}
        		
        	},
        	"intAttribute":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "int";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}
        		
        	},
        	"doubleAttribute":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "double";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}
        		
        	},
        	"dateAttribute":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "date";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}        		
        	},
        	"uriAttribute":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "uri";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}        		
        	},
        	"measureAttribute":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "measure";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}
        		
        	},
        	"genericAttributeSet":function(node, container){
        		var genericAttribute = this.readers.gen.genericAttribute.apply(this, [node, container]);
        		if(genericAttribute){
        			genericAttribute.type = "generic";
        			container.attributes.genericAttributes.push(genericAttribute);
        		}        		
        	},
        	"value":function(node, genericAttribute){
        		var value = this.getChildValue(node);
        		genericAttribute.value = value;
        	}
         
    	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]), 
        "bldg": OpenLayers.Util.applyDefaults({
        	"Building":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])},
        	"yearOfConstruction":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"yearOfDemolition":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"roofType":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"measuredHeight":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"storeysAboveGround":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"storeysBelowGround":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"storeyHeightsAboveGround":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"storeyHeightsBelowGround":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"address":function(node, obj) {
                this.readChildNodes(node, obj);
            }        
    	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),   
    	"brid": OpenLayers.Util.applyDefaults({
    		"Bridge":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
    		"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])},
        	"yearOfConstruction":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"yearOfDemolition":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"isMovable":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"]        	
    		},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),  
		"tun": OpenLayers.Util.applyDefaults({
    		"Tunnel":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
    		"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])},
        	"yearOfConstruction":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"yearOfDemolition":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"]        	
    		},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),
		"frn": OpenLayers.Util.applyDefaults({
        	"CityFurniture":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])}
			},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]), 
		"grp": OpenLayers.Util.applyDefaults({
			"CityObjectGroup":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
			"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])}
        	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),
		"luse": OpenLayers.Util.applyDefaults({
			"LandUse":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
			"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])}
			},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),      
        "tran": OpenLayers.Util.applyDefaults({
        	"TransportationComplex":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"Road":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"Square":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"Track":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"Railway":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"TrafficArea":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"AuxiliaryTrafficArea":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])}
    		},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),
		 "veg": OpenLayers.Util.applyDefaults({
        	"SolitaryVegetationObject":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"PlantCover":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])},
        	"species":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"height":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"trunkDiameter":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"crownDiameter":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"averageHeight":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"]
        	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),
        "wtr": OpenLayers.Util.applyDefaults({
        	"WaterBody":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"],
        	"class":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_attribute"],
        	"function":function(node, obj){this.readers["function"].apply(this, [node, obj])},
        	"usage":function(node, obj){this.readers["usage"].apply(this, [node, obj])}
    		},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"]),   
        "app": OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"],
        "tex": OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"],        
        "dem":OpenLayers.Util.applyDefaults({
        	"ReliefFeature":OpenLayers.Format.GML.v3_2_1.prototype.readers["feature"]["_typeName"]
        	},OpenLayers.Format.GML.v3_2_1.prototype.readers["gml"])
                               
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
    	"wfs": OpenLayers.Util.applyDefaults({
        	"GetFeature": function(options) {
        		var node = this.createElementNSPlus("wfs:GetFeature", {
                    attributes: {
                        service: "WFS",
                        version: this.version,
                        handle: options && options.handle,
                        outputFormat: options && options.outputFormat,
                        resultType: options && options.resultType,
                        startIndex: options && options.startIndex,
                        count: options.count,
                        "xsi:schemaLocation": this.schemaLocationAttr(options)
                    }
                });
        		        		
                this.setAttributes(node, {
                	"xmlns:gml":"http://www.opengis.net/gml/3.2",
                	"xmlns:core":"http://www.opengis.net/citygml/2.0", 
                	"xmlns:citydb":"http://www.3dcitydb.org/citygml-ade/3.0",
                	"xmlns:tran":"http://www.opengis.net/citygml/transportation/2.0", 
                	"xmlns:wtr":"http://www.opengis.net/citygml/waterbody/2.0", 
                	"xmlns:grp":"http://www.opengis.net/citygml/cityobjectgroup/2.0", 
                	"xmlns:luse":"http://www.opengis.net/citygml/landuse/2.0",
                	"xmlns:frn":"http://www.opengis.net/citygml/cityfurniture/2.0", 
                	"xmlns:app":"http://www.opengis.net/citygml/appearance/2.0", 
                	"xmlns:tex":"http://www.opengis.net/citygml/texturedsurface/2.0", 
                	"xmlns:bldg":"http://www.opengis.net/citygml/building/2.0", 
                	"xmlns:xal":"urn:oasis:names:tc:ciq:xsdschema:xAL:2.0", 
                	"xmlns:dem":"http://www.opengis.net/citygml/relief/2.0", 
                	"xmlns:veg":"http://www.opengis.net/citygml/vegetation/2.0", 
                	"xmlns:gen":"http://www.opengis.net/citygml/generics/2.0",
                	"xmlns:brid":"http://www.opengis.net/citygml/bridge/2.0",
                	"xmlns:tun":"http://www.opengis.net/citygml/tunnel/2.0"
                });                         
                this.writeNode("Query", options, node);
                return node;
            },  
            "Query": function(options) {
                options = OpenLayers.Util.extend({                    
                	featureNS: this.featureNS,
                    featurePrefix: this.featurePrefix,
                    featureType: this.featureType,
                	srsName: this.srsName                    
                }, options);
                var prefix = options.featurePrefix;
                
                //var featuretypes ="bldg:Building tran:TransportationComplex tran:Road tran:Track tran:Square tran:Railway frn:CityFurniture luse:LandUse wtr:WaterBody veg:PlantCover veg:SolitaryVegetationObject dem:ReliefFeature gen:GenericCityObject grp:CityObjectGroup"; 
                var node = this.createElementNSPlus("wfs:Query", {
                    attributes: {
                        typeNames: options.featureType                        
                    }
                });
                if(options.featureNS) {
                    this.setAttributeNS(
                        node, this.namespaces.xmlns,
                        "xmlns:" + prefix, options.featureNS
                    );
                }               
                if(options.propertyNames) {
                    for(var i=0,len = options.propertyNames.length; i<len; i++) {
                        this.writeNode(
                            "wfs:PropertyName", 
                            {property: options.propertyNames[i]},
                            node
                        );
                    }
                }
                if(options.filter) {
                    this.setFilterProperty(options.filter);
                    this.writeNode("fes:Filter", options.filter, node);
                }
                return node;
            }}, OpenLayers.Format.WFST.v2_0_0.prototype.writers["wfs"]),
        "gml31": OpenLayers.Format.GML.v3_2_1.prototype.writers["gml"],
        "gml": OpenLayers.Format.GML.v3_2_1.prototype.writers["gml"],
        "feature": OpenLayers.Format.GML.v3_2_1.prototype.writers["feature"],
        "fes": OpenLayers.Format.Filter.v2_0_0.prototype.writers["fes"]
    },
   
    CLASS_NAME: "OpenLayers.Format.WFST.CityGML" 
});
