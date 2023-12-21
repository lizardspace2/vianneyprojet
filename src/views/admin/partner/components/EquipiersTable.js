import React, { useEffect, useState } from 'react';
import {
  Box,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Stack,
  Heading,
  Image,
  Badge,
} from '@chakra-ui/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdPlace } from "react-icons/md";
import { renderToString } from "react-dom/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvpsmyizvorwwccuwbuq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cHNteWl6dm9yd3djY3V3YnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjgzMDg2MCwiZXhwIjoyMDE4NDA2ODYwfQ.9YDEN41__xBFJU91XY9e3r119A03yQ2oq5azmrx1aqY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EquipiersTable = ({ showAll }) => {
  const [equipiers, setEquipiers] = useState([]);
  const [selectedEquipier, setSelectedEquipier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onRowClick = (equipier) => {
    setSelectedEquipier(equipier);
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (selectedEquipier && isModalOpen) {
      const mapId = `map-${selectedEquipier.id}`;

      requestAnimationFrame(() => {
        const mapContainer = document.getElementById(mapId);
        if (mapContainer && !mapContainer._leaflet) {
          const map = L.map(mapId).setView([selectedEquipier.latitude, selectedEquipier.longitude], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

          equipiers.forEach(team => {
            // Use a different color for the selected team
            const icon = team.id === selectedEquipier.id ? createCustomIcon('blue') : createCustomIcon();
            L.marker([team.latitude, team.longitude], { icon }).addTo(map);
          });
        }
      });

      return () => {
        // Cleanup code
      };
    }
  }, [selectedEquipier, isModalOpen, equipiers]);

  // Style for hover state
  const hoverStyle = {
    bg: useColorModeValue('gray.100', 'gray.700'),
    cursor: 'pointer',
  };

  // Function to render an equipier photo
  const EquipierPhoto = ({ equipier, onClick }) => (
    <Box
      _hover={hoverStyle}
      onClick={() => onClick(equipier)}
      style={{
        cursor: 'pointer',
        marginBottom: '10px',
        borderRadius: '10px', // Add border radius
        width: '200px', // Set a specific width
        height: '200px', // Set a specific height
        overflow: 'hidden', // Hide any overflow
      }}
    >
      <Image
        size="full" // Use full size to fill the specified width and height
        src={equipier.photo_profile_url}

      />
    </Box>
  );

  useEffect(() => {
    const fetchEquipiers = async () => {
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('*');
      if (error) {
        console.log('Error fetching data:', error);
      } else {
        setEquipiers(data);
      }
    };

    fetchEquipiers();
  }, []);


  const createCustomIcon = (color = 'red') => {
    const iconHtml = renderToString(<MdPlace style={{ fontSize: '24px', color }} />);
    return L.divIcon({
      html: iconHtml,
      className: 'custom-leaflet-icon',
      iconSize: L.point(30, 30),
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };
  const renderTeamDetails = () => {
    if (!selectedEquipier) return null;

    const {
      name_of_the_team,
      status,
      last_active,
      type_d_equipe,
      numero_d_equipier,
      specialite,
      role_de_l_equipier,
      numero_de_telephone,
      mail,
      type_de_vehicule,
      immatriculation,
      photo_profile_url,
      latitude,
      longitude,
      team_members,
    } = selectedEquipier;

    const teamMembersList = team_members?.map(member => (
      <li key={member.id}>
        {`${member.firstname} ${member.familyname}`} {member.phone ? ` - ${member.phone}` : ''}
      </li>
    ));

    return (
      <Stack spacing={4} p={5} align="start">
        {photo_profile_url && (
          <Image
            borderRadius="full"
            boxSize="100px"
            src={photo_profile_url}
            alt="l'équipe"
          />
        )}
        <Heading size="md">{name_of_the_team}</Heading>
        <Text><strong>Statut :</strong> <Badge colorScheme={status ? 'green' : 'red'}>{status ? 'Actif' : 'Inactif'}</Badge></Text>
        <Text><strong>Dernière activité :</strong> {new Date(last_active).toLocaleDateString('fr-FR')}</Text>
        <Text><strong>Type d'équipe :</strong> {type_d_equipe}</Text>
        <Text><strong>Numéro de membre :</strong> {numero_d_equipier}</Text>
        <Text><strong>Spécialité :</strong> {specialite}</Text>
        <Text><strong>Rôle :</strong> {role_de_l_equipier}</Text>
        <Text><strong>Numéro de téléphone :</strong> {numero_de_telephone}</Text>
        <Text><strong>Email :</strong> {mail}</Text>
        <Text><strong>Type de véhicule :</strong> {type_de_vehicule}</Text>
        <Text><strong>Numéro d'immatriculation :</strong> {immatriculation}</Text>
        <Text><strong>Localisation :</strong> Latitude: {latitude}, Longitude: {longitude}</Text>
        <Heading size="sm">Membres de l'équipe :</Heading>
        <ul>{teamMembersList}</ul>
      </Stack>
    );
  };

  return (
    <>
      {equipiers.slice(0, showAll ? undefined : 3).map((equipier, index) => (
        <EquipierPhoto key={index} equipier={equipier} onClick={onRowClick} />
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="lg"
            fontWeight="bold"
            color="purple.600"
            bg="purple.100"
            p={3}
            borderRadius="md"
          >
            Détails sur l'équipe
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            color="purple.600"
          />

          <ModalBody>
            {renderTeamDetails()}
            <Box id={`map-${selectedEquipier?.id}`} h='500px' w='100%' mt={4} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EquipiersTable;
