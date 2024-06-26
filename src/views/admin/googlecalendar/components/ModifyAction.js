import React, { useState, useEffect } from 'react';
import { Button, Icon, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Textarea, Box } from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const ModifyAction = ({ initialActionData }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [action, setAction] = useState({
        actionId: '',
        actionName: '',
        startingDate: '',
        endingDate: '',
        actionComment: '',
        teamName: '',
    });

    const supabaseUrl = 'https://pvpsmyizvorwwccuwbuq.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cHNteWl6dm9yd3djY3V3YnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjgzMDg2MCwiZXhwIjoyMDE4NDA2ODYwfQ.9YDEN41__xBFJU91XY9e3r119A03yQ2oq5azmrx1aqY';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    useEffect(() => {
        if (initialActionData) {
            setAction({
                actionId: initialActionData.id,
                actionName: initialActionData.action_name,
                startingDate: initialActionData.starting_date,
                endingDate: initialActionData.ending_date,
                actionComment: initialActionData.action_comment,
                teamName: '',
            });
            setModalOpen(true);
        }
    }, [initialActionData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAction({ ...action, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Updating action with ID:', action.actionId);
      
        const updatedAction = {
          action_name: action.actionName,
          starting_date: action.startingDate,
          ending_date: action.endingDate,
          action_comment: action.actionComment,
        };
      
        try {
          const { error } = await supabase
            .from('vianney_actions')
            .update(updatedAction)
            .eq('id', action.actionId); // Ensure actionId is correctly set
      
          if (error) {
            console.error('Error updating action:', error);
          } else {
            console.log('Action updated successfully');
            // Handle success, e.g., close the modal or display a success message
          }
        } catch (error) {
          console.error('An error occurred while updating action:', error);
        }
      };

    return (
        <div>
            <Button
                onClick={() => setModalOpen(true)}
                p={1}
                borderRadius="full"
                display="flex"
                alignItems="center"
                boxShadow="md"
                _hover={{ boxShadow: "2xl" }}
            >
                <Icon as={FaEdit} w={7} h={7} />
                <Text pl={3} pr={7}>Modifier</Text>
            </Button>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Modifier l'action</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {/* Form elements here */}
                            <Box>
                                {action.teamName && <Text>Nom de l'équipe : {action.teamName}</Text>}
                                <form onSubmit={handleSubmit}>
                                    <FormControl isRequired>
                                        <FormLabel>Nom de l'action</FormLabel>
                                        <Input
                                            type="text"
                                            name="actionName"
                                            value={action.actionName}
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Date de début</FormLabel>
                                        <Input
                                            type="datetime-local"
                                            name="startingDate"
                                            value={action.startingDate}
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Date de fin</FormLabel>
                                        <Input
                                            type="datetime-local"
                                            name="endingDate"
                                            value={action.endingDate}
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Commentaire</FormLabel>
                                        <Textarea
                                            name="actionComment"
                                            value={action.actionComment}
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                    <Button colorScheme="blue" type="submit">
                                        Modifier l'action
                                    </Button>
                                </form>
                            </Box>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
};

export default ModifyAction;
